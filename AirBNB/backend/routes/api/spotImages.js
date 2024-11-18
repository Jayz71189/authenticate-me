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

module.exports = router;
