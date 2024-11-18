const express = require("express");
const router = express.Router();

const { Review, ReviewImage, User, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

// Route handler to get all reviews for a given user
router.get("/reviews", async (req, res) => {
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
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching reviews" });
  }
});

router.delete("/:reviewId", requireAuth, async (req, res) => {
  try {
    let reviewId = req.params.spotId;
    let review = await Review.findByPk(reviewId);
    //   include: {
    //     model: require("../../db/models/spotImage"),
    //     as: "previewImage", // Use the alias defined in the model
    //     attributes: ["previewImageUrl"], // Only include the URL of the preview image
    //   },

    if (!review) {
      res.status(404).json({ message: "Review couldn't be found" });
    }
    if (review.userId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized: You do not have permission to delete this spot",
      });
    }

    await review.destroy();
    return res.json({ message: "Successfully deleted" });

    res.json({ message: "Successfully deleted" }); // The response will now include previewImageUrl
  } catch (error) {
    //console.error("Error retrieving spot", error);
    res.status(500).json({ message: "Server error" });
  }
});

const getReviewsBySpotId = async (req, res) => {
  const { spotId } = req.params;

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Fetch reviews for the specified spot
    const reviews = await Review.findAll({
      where: { spotId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"], // Include reviewer info
        },
        {
          model: ReviewImage,
          attributes: ["id", "url"], // Include review images
        },
      ],
    });

    // Return reviews
    return res.status(200).json({ Reviews: reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = router;
