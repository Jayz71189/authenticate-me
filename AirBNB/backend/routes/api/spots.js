const express = require("express");
const router = express.Router();
const { check, query } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { requireAuth } = require("../../utils/auth");
const { Op, Sequelize } = require("sequelize");

const {
  Spot,
  SpotImage,
  Review,
  ReviewImage,
  User,
} = require("../../db/models");

//const { requireSpotOwnership } = require("../../utils/auth");

const validateQuery = [
  query("page")
    .optional()
    .default(1)
    .isInt({ min: 1 })
    .withMessage("Page must be greater than or equal to 1")
    .toInt(),
  query("size")
    .optional()
    .default(20)
    .isInt({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20")
    .toInt(),
  query("minLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Minimum latitude is invalid")
    .toFloat(),
  query("maxLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Maximum latitude is invalid")
    .toFloat(),
  query("minLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Minimum longitude is invalid")
    .toFloat(),
  query("maxLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Maximum longitude is invalid")
    .toFloat(),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be greater than or equal to 0")
    .toFloat(),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be greater than or equal to 0")
    .toFloat(),
  handleValidationErrors,
];

router.get("/", validateQuery, async (req, res) => {
  const { query } = req;
  query.page ||= 1;
  query.size ||= 20;
  const { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    query;

  // Validate query parameters
  const errors = {};

  if (page < 1) errors.page = "Page must be greater than or equal to 1";
  if (size < 1 || size > 20) errors.size = "Size must be between 1 and 20";
  if (minLat && isNaN(minLat)) errors.minLat = "Minimum latitude is invalid";
  if (maxLat && isNaN(maxLat)) errors.maxLat = "Maximum latitude is invalid";
  if (minLng && isNaN(minLng)) errors.minLng = "Minimum longitude is invalid";
  if (maxLng && isNaN(maxLng)) errors.maxLng = "Maximum longitude is invalid";
  if (minPrice && minPrice < 0)
    errors.minPrice = "Minimum price must be greater than or equal to 0";
  if (maxPrice && maxPrice < 0)
    errors.maxPrice = "Maximum price must be greater than or equal to 0";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Bad Request", errors });
  }

  // Query filters
  const filters = {};
  if (minLat) filters.lat = { [Op.gte]: parseFloat(minLat) };
  if (maxLat) filters.lat = { ...filters.lat, [Op.lte]: parseFloat(maxLat) };
  if (minLng) filters.lng = { [Op.gte]: parseFloat(minLng) };
  if (maxLng) filters.lng = { ...filters.lng, [Op.lte]: parseFloat(maxLng) };
  if (minPrice) filters.price = { [Op.gte]: parseInt(minPrice) };
  if (maxPrice)
    filters.price = { ...filters.price, [Op.lte]: parseInt(maxPrice) };

  const limit = Math.min(size, 20); // Enforce max size limit of 20
  const offset = (page - 1) * limit;

  const spot = await Spot.findAll({
    order: [["name", "DESC"]],
    where: filters,
    limit,
    offset,
  });

  //     const safeUser = {
  //       id: user.id,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       email: user.email,
  //       username: user.username,

  //   id: spot.id,
  //   ownerId: spot.ownerId,
  //   address: spot.address,
  //   city: spot.city,
  //   state: spot.state,
  //   country: spot.country,
  //   lat: spot.lat,
  //   lng: spot.lng,
  //   name: spot.name,
  //   description: spot.description,
  //   price: spot.price,
  //   createdAt: spot.createdAt,
  //   updatedAt: spot.updatedAt,
  //   avgRating: spot.avgRating,
  //   previewImage: spot.previewImage,
  //     };
  try {
    const spots = await Spot.findAll();
    res
      .status(200)
      .json({ Spots: spots, page: parseInt(page), size: parseInt(size) });
  } catch (error) {
    console.error("Error fetching spots:", error);
    res.status(500).json({ Spots: "Server error" });
  }
});

//Get spots of current user
router.get("/current", requireAuth, async (req, res) => {
  const { user } = req;

  const spots = await Spot.findAll({
    where: { ownerId: user.id },
  });

  return res.status(200).json({ Spots: spots });
});

// Get all Reviews by a Spot's id
router.get("/:spotId/reviews", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const spotIdNumber = parseInt(spotId);

  const spot = await Spot.findByPk(spotIdNumber);

  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
    });
  }

  const reviews = await Review.findAll({
    where: {
      spotId: spotIdNumber,
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"],
      },
    ],
  });
  return res.status(200).json({ Reviews: reviews });
});

router.get("/:spotId", async (req, res) => {
  try {
    const { spotId } = req.params;
    let spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: User,
          as: "Owner",
          attributes: ["id", "firstName", "lastName"],
        },
        //     //     as: "previewImage", // Use the alias defined in the model
        //     //    attributes: ["previewImageUrl"], // Only include the URL of the preview image
        //     //  }

        {
          model: SpotImage,
          // Alias defined in association
          as: "SpotImages",
          attributes: ["id", "url", "preview"],
        },
        // Alias defined in association
      ],
    });

    // if (spot) {
    //   res.json(spot); // The response will now include previewImageUrl }
    if (!spot) {
      res.status(404).json({ message: "Spot couldn't be found" });
    }

    //const numReviews = await Review.count({ where: { spotId } });
    // Calculate numReviews and avgStarRating
    const reviews = await Review.findAll({
      where: { spotId },
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("id")), "numReviews"],
        [Sequelize.fn("AVG", Sequelize.col("stars")), "avgStarRating"],
      ],
      raw: true,
    });

    const { numReviews, avgStarRating } = reviews[0] || {
      numReviews: 0,
      avgStarRating: null,
    };

    const spotDetails = {
      ...spot.toJSON(),
      numReviews,
      avgStarRating: avgStarRating
        ? parseFloat(avgStarRating).toFixed(1)
        : null,
    };

    //const spotDetails = {
    //spot,
    // id: spot.id,
    // ownerId: spot.ownerId,
    // address: spot.address,
    // avgStarRating: spot.avgRating,
    // city: spot.city,
    // state: spot.state,
    // country: spot.country,
    // lat: spot.lat,
    // lng: spot.lng,
    // name: spot.name,
    // description: spot.description,
    // price: spot.price,
    // createdAt: spot.createdAt,
    // updatedAt: spot.updatedAt,
    // SpotImages: SpotImage,
    // Owner: Owner,
    //avgStarRating: Review.stars,
    //numReviews,
    //};

    return res.status(200).json(spotDetails);
  } catch (error) {
    console.error("Error retrieving spot: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:spotId/reviews", requireAuth, async (req, res, next) => {
  try {
    const spotId = req.params.spotId;
    const { review, stars } = req.body;
    const userId = parseInt(req.user.id);

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }
    // if (spot.ownerId !== userId) {
    //   return res.status(403).json({
    //     message: "Forbidden",
    //   });
    // }

    // Check if the user has already reviewed this spot
    const existingReview = await Review.findOne({
      where: {
        spotId,
        userId: req.user.id,
      },
    });

    if (existingReview) {
      const err = new Error("User already has a review for this spot");
      err.status = 500;
      return next(err);
    }

    // Validate review body
    // if (!review) {
    //   const err = new Error("Validation error");
    //   err.status = 400;
    //   err.errors = { review: "Review text is required" };
    //   return next(err);
    // }

    // if (!stars || stars < 1 || stars > 5) {
    //   const err = new Error("Validation error");
    //   err.status = 400;
    //   err.errors = { stars: "Stars must be an integer from 1 to 5" };
    //   return next(err);
    // }
    const errors = {};
    if (!review) errors.review = "Review text is required";
    if (!stars || stars < 1 || stars > 5)
      errors.stars = "Stars must be an integer from 1 to 5";

    if (Object.keys(errors).length > 0) {
      const err = new Error("Validation error");
      err.status = 400;
      err.errors = errors;
      return next(err);
    }
    const newReview = await Review.create({
      userId,
      spotId,
      review,
      stars,
    });

    return res.status(201).json(newReview);

    //{ id: image.id, url: image.url });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

router.get("/:spotId/reviews", async (req, res) => {
  try {
    let spotId = req.params.spotId;
    let spot = await Spot.findByPk(spotId);

    // if (spot) {
    //   res.json(spot); // The response will now include previewImageUrl }
    if (!spot) {
      res.status(404).json({ message: "Spot couldn't be found" });
    }
    const reviews = await Review.findAll({
      where: { spotId: spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        message: "No reviews found for this spot",
      });
    }

    // Format the response
    const reviewDetails = reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      spotId: review.spotId,
      review: review.review,
      stars: review.stars,
      User: review.User,
      ReviewImages: review.ReviewImages,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));

    return res.status(200).json({ Reviews: reviewDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
//     const existingReview = await ReviewReview.findOne({
//       where: {
//         spotId,
//         userId,
//       },
//     });

//     if (existingReview) {
//       return res.status(500).json({
//         message: "User already has a review for this spot",
//       });
//     }

//     return res.status(201).json({
//       id: newReview.id,
//       userId: newReview.userId,
//       spotId: newReview.spotId,
//       review: newReview.review,
//       stars: newReview.stars,
//       createdAt: newReview.createdAt,
//       updatedAt: newReview.updatedAt,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

router.delete("/:spotId", requireAuth, async (req, res) => {
  try {
    let spotId = req.params.spotId;
    let spot = await Spot.findByPk(spotId);
    //   include: {
    //     model: require("../../db/models/spotImage"),
    //     as: "previewImage", // Use the alias defined in the model
    //     attributes: ["previewImageUrl"], // Only include the URL of the preview image
    //   },

    if (!spot) {
      res.status(404).json({ message: "Spot couldn't be found" });
    }
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized: You do not have permission to delete this spot",
      });
    }

    await spot.destroy();
    return res.json({ message: "Successfully deleted" });

    res.json({ message: "Successfully deleted" }); // The response will now include previewImageUrl
  } catch (error) {
    //console.error("Error retrieving spot", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  // Validate body fields before creating the Spot

  let spotId = req.params.spotId;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

  if (
    !address ||
    !city ||
    !state ||
    !country ||
    !lat ||
    !lng ||
    !name ||
    !description ||
    !price
  ) {
    return res.status(400).json({
      message: "Bad Request",
      errors: {
        address: "Street address is required",
        city: "City is required",
        state: "State is required",
        country: "Country is required",
        lat: "Latitude must be within -90 and 90",
        lng: "Longitude must be within -180 and 180",
        name: "Name must be less than 50 characters",
        description: "Description is required",
        price: "Price per day must be a positive number",
      },
    });
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({
      message: "Bad Request",
      errors: {
        lat: "Latitude must be within -90 and 90",
      },
    });
  }

  if (lng < -180 || lng > 180) {
    return res.status(400).json({
      message: "Bad Request",
      errors: {
        lng: "Longitude must be within -180 and 180",
      },
    });
  }

  if (name.length > 50) {
    return res.status(400).json({
      message: "Bad Request",
      errors: {
        name: "Name must be less than 50 characters",
      },
    });
  }

  if (price <= 0) {
    return res.status(400).json({
      message: "Bad Request",
      errors: {
        price: "Price per day must be a positive number",
      },
    });
  }

  // Create a new Spot instance
  const newSpot = await Spot.create({
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
    ownerId: req.user.id, // Assume the user ID is stored in the decoded JWT
  });

  return res.status(201).json(
    // newSpot);

    {
      id: newSpot.id,
      ownerId: newSpot.ownerId,
      address: newSpot.address,
      city: newSpot.city,
      state: newSpot.state,
      country: newSpot.country,
      lat: newSpot.lat,
      lng: newSpot.lng,
      name: newSpot.name,
      description: newSpot.description,
      price: newSpot.price,
      createdAt: newSpot.createdAt,
      updatedAt: newSpot.updatedAt,
    }
  );
});

router.put("/:spotId", requireAuth, async (req, res) => {
  try {
    // Validate body fields before creating the Spot

    let spotId = req.params.spotId;
    const {
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
    } = req.body;

    if (
      !address ||
      !city ||
      !state ||
      !country ||
      !lat ||
      !lng ||
      !name ||
      !description ||
      !price
    ) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          address: "Street address is required",
          city: "City is required",
          state: "State is required",
          country: "Country is required",
          lat: "Latitude must be within -90 and 90",
          lng: "Longitude must be within -180 and 180",
          name: "Name must be less than 50 characters",
          description: "Description is required",
          price: "Price per day must be a positive number",
        },
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          lat: "Latitude must be within -90 and 90",
        },
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          lng: "Longitude must be within -180 and 180",
        },
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          name: "Name must be less than 50 characters",
        },
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors: {
          price: "Price per day must be a positive number",
        },
      });
    }

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
      });
    }

    // Step 3: Check if the spot belongs to the current user
    if (spot.ownerId !== req.user.id) {
      // assuming req.user.id contains the authenticated user's ID
      return res.status(403).json({
        message: "You do not have permission to edit this spot",
      });
    }

    // Step 4: Update the spot with the new data
    // res.status(201).json(
    // newSpot);

    //   {
    //     id: Spot.id,
    //     ownerId: Spot.ownerId,
    //     address: Spot.address,
    //     city: Spot.city,
    //     state: Spot.state,
    //     country: Spot.country,
    //     lat: Spot.lat,
    //     lng: Spot.lng,
    //     name: Spot.name,
    //     description: Spot.description,
    //     price: Spot.price,
    //     createdAt: Spot.createdAt,
    //     updatedAt: Spot.updatedAt,
    //   }
    // );
    // Save the updated spot to the database

    // Create a new Spot instance
    // const newSpot = await Spot.create({
    //   address,
    //   city,
    //   state,
    //   country,
    //   lat,
    //   lng,
    //   name,
    //   description,
    //   price,
    //   ownerId: req.user.id, // Assume the user ID is stored in the decoded JWT
    // });
    spot.address = address;
    spot.city = city;
    spot.state = state;
    spot.country = country;
    spot.lat = lat;
    spot.lng = lng;
    spot.name = name;
    spot.description = description;
    spot.price = price;
    await spot.save();
    return res.status(200).json(spot);
    //   // newSpot);

    //   {
    //     id: newSpot.id,
    //     ownerId: newSpot.ownerId,
    //     address: newSpot.address,
    //     city: newSpot.city,
    //     state: newSpot.state,
    //     country: newSpot.country,
    //     lat: newSpot.lat,
    //     lng: newSpot.lng,
    //     name: newSpot.name,
    //     description: newSpot.description,
    //     price: newSpot.price,
    //     createdAt: newSpot.createdAt,
    //     updatedAt: newSpot.updatedAt,
    //   }
    // );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

//     // For unexpected errors, send a generic server error
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.post("/:spotId/images", requireAuth, async (req, res) => {
  let spotId = req.params.spotId;
  let { url, preview } = req.body;

  try {
    // Check if the spot exists
    const spotImage = await Spot.findByPk(spotId);

    if (!spotImage) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    if (spotImage.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Create the new SpotImage
    const newSpotImage = await SpotImage.create({ spotId, url, preview });

    // Return the created SpotImage
    res.status(201).json(
      newSpotImage
      //   id: spotImage.id,
      //   url: spotImage.url,
      //   preview: spotImage.preview,
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

const editReview = async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id; // Assuming `req.user` contains the authenticated user

  try {
    // Find the review by ID
    const existingReview = await Review.findByPk(reviewId);

    // Handle case where review is not found
    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Ensure the review belongs to the current user
    if (existingReview.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Validate input
    if (!review) {
      return res.status(400).json({
        message: "Bad Request",
        errors: { review: "Review text is required" },
      });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({
        message: "Bad Request",
        errors: { stars: "Stars must be an integer from 1 to 5" },
      });
    }

    router.get("/:spotId/reviews", requireAuth, async (req, res) => {
      let spotId = req.params.spotId;

      try {
        // Check if the spot exists
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
          return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Fetch all reviews for the spot
        const reviews = await Review.findAll({
          where: { spotId },
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName"],
            },
            {
              model: ReviewImage,
              attributes: ["id", "url"],
            },
          ],
        });

        // Format the response
        // const formattedReviews = reviews.map((review) => ({
        //   id: review.id,
        //   userId: review.userId,
        //   spotId: review.spotId,
        //   review: review.review,
        //   stars: review.stars,
        //   createdAt: review.createdAt,
        //   updatedAt: review.updatedAt,
        //   User: review.User,
        //   ReviewImages: review.ReviewImages,
        // }));

        // return res.status(200).json({ Reviews: formattedReviews });

        return res.status(200).json(reviews);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // Update the review
    existingReview.review = review;
    existingReview.stars = stars;
    await existingReview.save();

    // Return the updated review
    return res.status(200).json(existingReview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addReviewImage = async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id; // Assuming `req.user` contains the authenticated user

  try {
    // Find the review by ID
    const review = await Review.findByPk(reviewId);

    // Handle case where review is not found
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    // Ensure the review belongs to the current user
    if (review.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check the number of existing images for this review
    const imageCount = await ReviewImage.count({ where: { reviewId } });
    if (imageCount >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this resource was reached",
      });
    }

    // Create a new review image
    const reviewImage = await ReviewImage.create({ reviewId, url });

    // Return the created image
    return res.status(201).json({
      id: reviewImage.id,
      url: reviewImage.url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = router;
