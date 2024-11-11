"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.belongsTo(models.User, { foreignKey: "ownerId" });
      //   Spot.hasMany(models.Review, {
      //     foreignKey: "spotId",
      //   });
      //   Spot.hasMany(models.Booking, {
      //     foreignKey: "spotId",
      //   });
      Spot.belongsTo(models.SpotImage, {
        foreignKey: "id",
        as: "PreviewImage",
      });
    }
  }
  Spot.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      //id: spot.id,
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "City is required" },
        },
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "City is required" },
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "City is required" },
        },
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: { msg: "Latitude must be a number" },
          min: -90,
          max: 90,
          notEmpty: { msg: "Latitude is required" },
        },
      },
      lng: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          isFloat: { msg: "Longitude must be a number" },
          min: -180,
          max: 180,
          notEmpty: { msg: "Longitude is required" },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 26],
        },
      },
      description: {
        type: DataTypes.CHAR,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Description is required" },
        },
      },
      price: {
        type: DataTypes.NUMERIC(10, 2),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Description is required" },
        },
      },
      //createdAt: spot.createdAt,
      //updatedAt: spot.updatedAt,
      avgRating: {
        type: DataTypes.DECIMAL(1, 3),
        allowNull: true,
      },
      previewImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Spot",
    }
  );
  return Spot;
};
