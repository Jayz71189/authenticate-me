const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../config");
const { User } = require("../db/models");

const { secret, expiresIn } = jwtConfig;

const setTokenCookie = (res, user) => {
  // Create the token.
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(
    { data: safeUser },
    secret,
    { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the token cookie
  res.cookie("token", token, {
    maxAge: expiresIn * 1000, // maxAge in milliseconds
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax",
  });

  return token;
};

const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const { token } = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (err, jwtPayload) => {
    if (err) {
      return next();
    }

    try {
      const { id } = jwtPayload.data;
      req.user = await User.findByPk(id, {
        attributes: {
          include: ["email", "createdAt", "updatedAt"],
        },
      });
    } catch (e) {
      res.clearCookie("token");
      return next();
    }

    if (!req.user) res.clearCookie("token");

    return next();
  });
};

const requireAuth = function (req, _res, next) {
  if (req.user) return next();

  const err = new Error("Authentication required");
  err.title = "Authentication required";
  err.errors = { message: "Authentication required" };
  err.status = 401;
  return next(err);
};

// const requireSpotOwnership = async (req, res, next) => {
//   const { spotId } = req.params; // Get the spotId from the request parameters
//   const userId = req.user.id; // Assuming req.user is the authenticated user

//   try {
//     // Find the spot by ID and check if it belongs to the current user
//     const spot = await Spot.findByPk(spotId);

//     if (!spot) {
//       return res.status(404).json({
//         message: "Spot couldn't be found",
//       });
//     }

//     // Check if the spot's owner matches the current user
//     if (spot.ownerId !== userId) {
//       return res
//         .status(403)
//         .json({ message: "Forbidden: You do not own this spot" });
//     }

//     // Proceed if the user owns the spot
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

module.exports = {
  setTokenCookie,
  restoreUser,
  requireAuth,
  // requireSpotOwnership,
};
