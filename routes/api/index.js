const express = require("express");
const app = express();

router.post("/", async (req, res) => {
  let { firstName, lastName, email, username } = req.body;

  const user = await User.create({
    firstName,
    lastName,
    email,
    username,
  });

  return res.status(200).json(user);
});

module.exports = app;
