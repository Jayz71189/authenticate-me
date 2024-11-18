const express = require("express");
const router = express.Router();

const { Review, ReviewImage, User, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// Route handler to get all reviews for a given user
const getAllReviewsByUser = async (req, res) => {
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
            "previewImage",
          ],
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"],
        },
      ],
    });

    // Return the reviews in the specified format
    res.status(200).json({ Reviews: reviews });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching reviews" });
  }
};

module.exports = router;
