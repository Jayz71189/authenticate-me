"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Spot.bulkCreate(
      [
        {
          id: 1,
          ownerId: 1,
          address: "123 Disney Lane",
          city: "San Francisco",
          state: "California",
          country: "United States of America",
          lat: 37.7645358,
          lng: -122.4730327,
          name: "App Academy",
          description: "Place where web developers are created",
          price: 123,
          // createdAt: "2021-11-19 20:39:36",
          // updatedAt: "2021-11-19 20:39:36",
          avgRating: 4.5,
          previewImage: "image url",
        },
        {
          id: 2,
          ownerId: 1,
          address: "1234 Disney Lane",
          city: "San Francisco",
          state: "California",
          country: "United States of America",
          lat: 37.7645358,
          lng: -122.4730327,
          name: "App Academy 2",
          description: "Place where web developers are created",
          price: 123,
          // createdAt: "2021-11-19 20:39:36",
          // updatedAt: "2021-11-19 20:39:36",
          avgRating: 4.5,
          previewImage: "image url",
        },
        {
          id: 3,
          ownerId: 1,
          address: "1235 Disney Lane",
          city: "San Francisco",
          state: "California",
          country: "United States of America",
          lat: 37.7645358,
          lng: -122.4730327,
          name: "App Academy 3",
          description: "Place where web developers are created",
          price: 123,
          // createdAt: "2021-11-19 20:39:36",
          // updatedAt: "2021-11-19 20:39:36",
          avgRating: 4.5,
          previewImage: "image url",
        },
      ],
      { validate: true }
    );
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
    options.tableName = "Spots";
    const Op = Sequelize.Op;
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
