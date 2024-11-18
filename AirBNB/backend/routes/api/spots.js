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

router.get("/:spotId", async (req, res) => {
  try {
    let spotId = req.params.spotId;
    let spot = await Spot.findByPk(spotId, {
      include: [
        {
          model: User,
        },
        //     as: "previewImage", // Use the alias defined in the model
        //    attributes: ["previewImageUrl"], // Only include the URL of the preview image
        //  }
      ],
    });

    // if (spot) {
    //   res.json(spot); // The response will now include previewImageUrl }
    if (!spot) {
      res.status(404).json({ message: "Spot not found" });
    }
    return res.status(200).json(spot);
  } catch (error) {
    console.error("Error retrieving spot: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:spotId", requireAuth, async (req, res) => {
  try {
    let spotId = req.params.spotId;
    let spot = await Spot.findByPk(spotId);
    //   include: {
    //     model: require("../../db/models/spotImage"),
    //     as: "previewImage", // Use the alias defined in the model
    //     attributes: ["previewImageUrl"], // Only include the URL of the preview image
    //   },

    if (!spot) {
      res.status(404).json({ message: "Spot couldn't be found" });
    }
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized: You do not have permission to delete this spot",
      });
    }

    await spot.destroy();
    return res.json({ message: "Successfully deleted" });

    res.json({ message: "Successfully deleted" }); // The response will now include previewImageUrl
  } catch (error) {
    //console.error("Error retrieving spot", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  // Validate body fields before creating the Spot

  let spotId = req.params.spotId;
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;

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

  return res.status(201).json(newSpot);
  //   } catch (error) {
  //     console.error("Error creating spot:", error);
  //     res.status(500).json({ message: "Server error" });
  //   }
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

router.post("/:spotId/images", requireAuth, async (req, res) => {
  let spotId = req.params.spotId;
  let { url, preview } = req.body;

  try {
    // Check if the spot exists
    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      return res.status(404).json({ message: "Spot couldn't be found" });
    }

    // Check if the current user is the owner of the spot
    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Create the new SpotImage
    const spotImage = await SpotImage.create({ spotId, url, preview });

    // Return the created SpotImage
    res.status(201).json({
      id: spotImage.id,
      url: spotImage.url,
      preview: spotImage.preview,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});

module.exports = router;
