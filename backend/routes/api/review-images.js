const express = require("express");
const { requireAuth } = require("../../utils/auth");
const { Review, ReviewImage } = require("../../db/models");

const router = express.Router();

router.delete("/:imageId", requireAuth, async (req, res) => {
  const { user } = req;
  const { imageId } = req.params;
  const imageIdNumber = parseInt(imageId);
  // include Review associated with image, and User associated with that
  // review
  const reviewImage = await ReviewImage.findByPk(imageIdNumber, {
    include: { model: Review, attributes: ["userId"] },
  });
  if (!reviewImage) {
    return res.status(404).json({ message: "Review Image couldn't be found" });
  }
  //check if review's user id matches user.id
  // if it does, res.status(403).json({message:"Forbidden"})
  if (reviewImage.Review.userId !== user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }
  reviewImage.destroy();
  return res.json({ message: "Successfully deleted" });
});

module.exports = router;
