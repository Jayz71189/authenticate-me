"use strict";
const { Model } = require("sequelize");

// models/Image.js
module.exports = (sequelize, DataTypes) => {
  const SpotImage = sequelize.define("SpotImage", {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    spotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Spots", // The Spot model that this image is related to
        key: "id", // The key in the Spots table
      },
      onDelete: "CASCADE", // If the related spot is deleted, so should the spot image
      onUpdate: "CASCADE", // If the spot ID changes, update the foreign key accordingly
    },
    spotImage: {
      type: DataTypes.BLOB("long"), // Stores binary data for the full-size image
    },
    previewImage: {
      type: DataTypes.STRING, // Stores the URL or path to the preview image
      allowNull: true,
    },
  });

  SpotImage.associate = (models) => {
    SpotImage.belongsTo(models.Spot, {
      foreignKey: "spotId", // Foreign key in SpotImages table
      as: "spot", // Alias to access the related Spot model
    });
  };
  return SpotImage;
};
