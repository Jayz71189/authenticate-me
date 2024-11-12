const express = require("express");
const router = express.Router();

const { Spot, SpotImage } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
//const { requireSpotOwnership } = require("../../utils/auth");

router.get("/", async (req, res) => {
  const spot = await Spot.findAll({
    order: [["name", "DESC"]],
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
    res.status(200).json({ Spots: spot });
  } catch (error) {
    console.error("Error fetching spots:", error);
    res.status(500).json({ Spots: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id, {
      //   include: {
      //     model: require("../../db/models/spotImage"),
      //     as: "previewImage", // Use the alias defined in the model
      //     attributes: ["previewImageUrl"], // Only include the URL of the preview image
      //   },
    });

    // if (spot) {
    //   res.json(spot); // The response will now include previewImageUrl }
    if (!spot) {
      res.status(404).json({ message: "Spot not found" });
    }
    res.status(200).json(spot);
  } catch (error) {
    console.error("Error retrieving spot: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id, {
      //   include: {
      //     model: require("../../db/models/spotImage"),
      //     as: "previewImage", // Use the alias defined in the model
      //     attributes: ["previewImageUrl"], // Only include the URL of the preview image
      //   },
    });

    if (!spot) {
      res.status(404).json({ message: "Spot couldn't be found" });
    }
    if (spot.userId !== req.user.id) {
      return res.status(403).json({
        error: "Unauthorized: You do not have permission to delete this spot",
      });
    }

    res.json({ message: "Successfully deleted" }); // The response will now include previewImageUrl
  } catch (error) {
    //console.error("Error retrieving spot", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  // Validate body fields before creating the Spot
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  try {
    const errors = {};

    if (!address) errors.address = "Street address is required";
    if (!city) errors.city = "City is required";
    if (!state) errors.state = "State is required";
    if (!country) errors.country = "Country is required";
    if (lat < -90 || lat > 90)
      errors.lat = "Latitude must be within -90 and 90";
    if (lng < -180 || lng > 180)
      errors.lng = "Longitude must be within -180 and 180";
    if (!name || name.length > 50)
      errors.name = "Name must be less than 50 characters";
    if (!description) errors.description = "Description is required";
    if (price <= 0) errors.price = "Price per day must be a positive number";

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Bad Request",
        errors: errors,
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

    res.status(201).json(newSpot);
  } catch (error) {
    console.error("Error creating spot:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// If validation errors occurred, send them back
//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.reduce((acc, curr) => {
//         acc[curr.path] = curr.message;
//         return acc;
//       }, {});
//       return res.status(400).json({
//         message: "Bad Request",
//         errors,
//       });
//     }

//     // For unexpected errors, send a generic server error
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.post(
  "/:id/spotImage",
  requireAuth,

  async (req, res) => {
    const { spotId } = req.params; // Get the spotId from the request parameters
    const { url, preview } = req.body; // Get the image data from the request body

    try {
      // Find the spot by ID
      const spot = await Spot.findByPk(spotId);

      // If the spot doesn't exist, return a 404 error
      if (!spot) {
        return res.status(404).json({
          message: "Spot couldn't be found",
        });
      }

      // Create the new SpotImage and associate it with the spot
      const newImage = await SpotImage.create({
        spotId: spot.id,
        imageUrl: url, // Image URL
        previewImage: preview, // Boolean flag for preview image
      });

      // Return the newly created image
      return res.status(201).json({
        id: newImage.id,
        url: newImage.imageUrl,
        preview: newImage.previewImage,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
