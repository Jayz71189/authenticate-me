"use strict";
const { Model } = require("sequelize");

// models/Image.js
module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      ReviewImage.belongsTo(models.Review, {
        foreignKey: "reviewId", // Foreign key in SpotImages table
        // as: "Review", // Alias to access the related Spot model
      });
    }
  }
  ReviewImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Reviews", // The Review model that this image is related to
          key: "id", // The key in the Reviews table
        },
        onDelete: "CASCADE", // If the related spot is deleted, so should the spot image
        onUpdate: "CASCADE", // If the spot ID changes, update the foreign key accordingly
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false, // Stores binary data for the full-size image
      },
    },
    {
      sequelize,
      modelName: "ReviewImage",
    }
  );
  return ReviewImage;
};
