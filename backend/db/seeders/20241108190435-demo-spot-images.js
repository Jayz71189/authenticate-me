"use strict";

const { SpotImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await SpotImage.bulkCreate([
        {
          id: 1,
          spotId: 1, // Assuming the spot ID is 1
          url: "https://example.com/image1.jpg",
          preview: true, // Marked as preview image
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          spotId: 2, // Assuming the spot ID is 2
          url: "https://example.com/image2.jpg",
          preview: false, // Not marked as preview
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          spotId: 3, // Assuming the spot ID is 3
          url: "https://example.com/image3.jpg",
          preview: true, // Marked as preview image
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
      throw "";
    }
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
