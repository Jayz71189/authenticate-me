"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Spots",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        ownerId: {
          type: Sequelize.INTEGER(50),
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true,
        },
        state: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true,
        },
        country: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: true,
        },
        lat: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        lng: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      options
    );
    /**
     *
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Spots";
    return queryInterface.dropTable(options);
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
