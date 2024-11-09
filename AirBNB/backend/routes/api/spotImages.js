const express = require("express");
const router = express.Router();
const SpotImage = require("../models/spotImage");

router.get("/spotImage/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const imageData = await SpotImage.findByPk(id);

    if (imageData) {
      res.json(imageData);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error retrieving image: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
