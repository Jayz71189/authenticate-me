"use strict";

const { Review, ReviewImages } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await Review.bulkCreate(
        [
          {
            id: 1,
            //userId: 1,
            spotId: 1,
            review: "This was an awesome spot!",
            stars: 5,
            // createdAt: "2021-11-19 20:39:36",
            // updatedAt: "2021-11-19 20:39:36",
          },
          {
            id: 2,
            //userId: 2,
            spotId: 2,
            review: "Nice place, but a bit expensive.",
            stars: 4,
            // createdAt: "2021-11-19 20:39:36",
            // updatedAt: "2021-11-19 20:39:36",
          },
          {
            id: 3,
            //userId: 3,
            spotId: 3,
            review: "Not great, there was a lot of noise.",
            stars: 3,
            // createdAt: "2021-11-19 20:39:36",
            // updatedAt: "2021-11-19 20:39:36",
          },
        ],
        { validate: true }
      );
      await queryInterface.bulkInsert("ReviewImages", [
        {
          id: 1,
          reviewId: 1, // Link to the Review with ID 1
          url: "https://example.com/image1.jpg",
          // createdAt: "2021-11-19 20:39:36",
          // updatedAt: "2021-11-19 20:39:36",
        },
        {
          id: 2,
          reviewId: 2, // Link to the Review with ID 2
          url: "https://example.com/image2.jpg",
          // createdAt: "2021-11-19 20:39:36",
          // updatedAt: "2021-11-19 20:39:36",
        },
        {
          id: 3,
          reviewId: 3, // Link to the Review with ID 3
          url: "https://example.com/image3.jpg",
          // createdAt: "2021-11-19 20:39:36",
          // updatedAt: "2021-11-19 20:39:36",
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
    options.tableName = "Reviews";
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete("ReviewImages", null, {});
    return queryInterface.bulkDelete(
      options,
      {
        name: { [Op.in]: ["App Academy", "App Academy 2", "App Academy 3"] },
      },
      {}
    );
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
