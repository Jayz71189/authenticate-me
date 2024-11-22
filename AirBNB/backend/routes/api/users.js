const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../db/models");
const { Sequelize, Op } = require("sequelize");

const router = express.Router();

const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email."),
  check("username")
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  const hashedPassword = bcrypt.hashSync(password);
  const user = await User.create({
    email,
    username,
    firstName,
    lastName,
    hashedPassword,
  });

  const safeUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
  };

  await setTokenCookie(res, safeUser);

  return res.status(201).json({
    user: safeUser,
  });
});

router.get("/:id", validateSignup, async (req, res) => {
  // const hashedPassword = bcrypt.hashSync(password);
  const user = await User.findByPk(req.params.id);

  // const safeUser = {
  //   id: user.id,
  //   firstName: user.firstName,
  //   lastName: user.lastName,
  //   email: user.email,
  //   username: user.username,
  // };

  // await setTokenCookie(res, safeUser);
  try {
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(201).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:userId/spots", requireAuth, async (req, res) => {
  // const { userId } = req.params;

  try {
    const { userId } = req.params;

    // Find all spots owned by the user
    const spots = await Spot.findAll({
      where: { ownerId: userId },
      include: [
        {
          model: Review,
          attributes: [
            [Sequelize.fn("AVG", Sequelize.col("stars")), "avgRating"],
          ],
        },
        {
          model: SpotImage,
          attributes: ["url"],
          where: { preview: true },
          required: false,
        },
      ],
      group: ["Spot.id", "SpotImages.id"],
    });

    // Format spots
    const formattedSpots = spots.map((spot) => {
      const spotData = spot.toJSON();
      return {
        id: spotData.id,
        ownerId: spotData.ownerId,
        address: spotData.address,
        city: spotData.city,
        state: spotData.state,
        country: spotData.country,
        lat: spotData.lat,
        lng: spotData.lng,
        name: spotData.name,
        description: spotData.description,
        price: spotData.price,
        createdAt: spotData.createdAt,
        updatedAt: spotData.updatedAt,
        avgRating: spotData.Reviews[0]?.avgRating || null,
        previewImage: spotData.SpotImages[0]?.url || null,
      };
    });

    return res.status(200).json({ Spots: formattedSpots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetch spots owned by the user
//     const spots = await Spot.findAll({
//       where: { ownerId: userId },
//       attributes: [
//         "id",
//         "ownerId",
//         "address",
//         "city",
//         "state",
//         "country",
//         "lat",
//         "lng",
//         "name",
//         "description",
//         "price",
//         "createdAt",
//         "updatedAt",
//         // Include calculated fields like avgRating and previewImage
//       ],
//     });

//     // Map results to include additional fields like avgRating and previewImage
//     const formattedSpots = spots.map((spot) => ({
//       ...spot.toJSON(),
//       avgRating: 4.5, // Replace with actual average rating calculation if needed
//       previewImage: "image url", // Replace with actual preview image URL if available
//     }));

//     // Respond with the spots data
//     return res.status(200).json({ Spots: formattedSpots });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.get("/:userId/reviews", async (req, res) => {
  const { userId } = req.params;

  try {
    // Make sure the current user is authorized to view their reviews
    if (req.user.id !== parseInt(userId, 10)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Fetch reviews with related Spot and ReviewImages
    const reviews = await Review.findAll({
      where: { userId: userId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: Spot,
          attributes: [
            "id",
            "ownerId",
            "address",
            "city",
            "state",
            "country",
            "lat",
            "lng",
            "name",
            "price",
            "preview",
          ],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        message: "No reviews found for this user",
      });
    }
    // Return the reviews in the specified format
    const reviewDetails = reviews.map((review) => ({
      id: review.id,
      userId: review.userId,
      spotId: review.spotId,
      review: review.review,
      stars: review.stars,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      User: review.User,
      Spot: review.Spot,
      ReviewImages: review.Spot.ReviewImages,
    }));

    return res.status(200).json({ Reviews: reviewDetails });
    //res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching reviews" });
  }
});

// router.get("/:id/spots", requireAuth, async (req, res) => {

module.exports = router;
