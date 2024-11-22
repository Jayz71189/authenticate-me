const express = require("express");
const router = express.Router();
const { Spot, SpotImage } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

router.get("/images/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const spotImage = await SpotImage.findByPk(id);

    if (spotImage) {
      res.json(spotImage);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error retrieving image: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new spot image for a given spot
router.post("/images", async (req, res) => {
  const { spotId } = req.params;
  const { url, preview } = req.body;

  try {
    // Ensure the spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot not found" });
    }

    // Create the spot image
    const newSpotImage = await SpotImage.create({
      spotId,
      url,
      preview: preview || false, // Default preview to false if not provided
    });

    return res.status(201).json(newSpotImage);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while creating the spot image" });
  }
});

router.post("/images", async (req, res) => {
  const { spotId, url, preview } = req.body;

  try {
    const spotImage = await SpotImage.create({ spotId, url, preview });
    res.status(201).json(spotImage);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Could not create Spot Image", details: error.message });
  }
});

router.delete("/:imageId", requireAuth, async (req, res) => {
  try {
    const { user } = req;
    const { imageId } = req.params;
    const imageIdNumber = parseInt(imageId);

    // Fetch the spot by ID to check ownership
    const image = await SpotImage.findByPk(imageIdNumber, {
      include: { model: Spot, attributes: ["ownerId"] },
    });

    if (!image) {
      return res.status(404).json({
        message: "Spot Image couldn't be found",
      });
    }

    // Check if the current user is the owner of the spot image
    if (image.Spot.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized: You do not have permission to delete this spot",
      });
    }

    // // Fetch the spot image by its ID
    // const spotImage = await SpotImage.findOne({
    //   where: {
    //     id: id,
    //     spotId: spotId,
    //   },
    // });

    // if (!spotImage) {
    //   return res.status(404).json({
    //     message: "Spot Image couldn't be found",
    //   });
    // }

    // Delete the image from the database
    image.destroy();

    return res.status(200).json({
      message: "Successfully deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
