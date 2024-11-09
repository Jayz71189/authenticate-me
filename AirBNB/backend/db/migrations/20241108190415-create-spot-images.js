"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "SpotImages",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        spotId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Spots", // Name of the referenced table
            key: "id",
          },
          onDelete: "CASCADE", // Ensures spotImages are deleted if the Spot is deleted
          onUpdate: "CASCADE",
        },
        imageUrl: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        previewImage: {
          type: Sequelize.BOOLEAN,
          defaultValue: false, // Set default value to false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      options
    );
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    return queryInterface.dropTable(options);
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
