const express = require("express");
const router = express.Router();

const { Spot, SpotImage } = require("../../db/models");
const { requireAuth, requireSpotOwnership } = require("../../utils/auth");

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

  return res.json({ Spots: spot });
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

    if (spot) {
      res.json(spot); // The response will now include previewImageUrl
    } else {
      res.status(404).json({ message: "Spot not found" });
    }
  } catch (error) {
    console.error("Error retrieving spot: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const spot = await Spot.findByPk(req.params.id, {
      //   include: {
      //     model: require("../../db/models/spotImage"),
      //     as: "previewImage", // Use the alias defined in the model
      //     attributes: ["previewImageUrl"], // Only include the URL of the preview image
      //   },
    });

    if (spot) {
      res.json({ message: "Successfully deleted" }); // The response will now include previewImageUrl
    } else {
      res.status(404).json({ message: "Spot couldn't be found" });
    }
  } catch (error) {
    console.error("Error retrieving spot: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    // Validate body fields before creating the Spot
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

    // If validation errors occurred, send them back
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.reduce((acc, curr) => {
        acc[curr.path] = curr.message;
        return acc;
      }, {});
      return res.status(400).json({
        message: "Bad Request",
        errors,
      });
    }

    // For unexpected errors, send a generic server error
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/:spotId/spotImage",
  requireAuth,
  requireSpotOwnership,
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
