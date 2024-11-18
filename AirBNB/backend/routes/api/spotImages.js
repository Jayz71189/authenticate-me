const express = require("express");
const router = express.Router();
const SpotImage = require("../../db/models");

router.get("/spotImage/:id", async (req, res) => {
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

router.post("/spotimage", async (req, res) => {
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
