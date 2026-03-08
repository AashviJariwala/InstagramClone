"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("posts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      userId: {
        type: Sequelize.BIGINT,
        references: {
          model: "users",
          key: "id",
        },
      },
      media: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      type:{
        type:Sequelize.ENUM("post","reel","prompt","story"),
        allowNull:false,
      },
      caption: {
        type: Sequelize.STRING(500),
      },
      location: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      tagPeople: {
        type: Sequelize.JSON, 
        defaultValue: [],
      },
      status: {
        type: Sequelize.STRING(20),
        defaultValue: "published",
        validate: { isIn: [["published", "archived", "deleted","private"]] },
        // type: Sequelize.ENUM,
        // values: ["published", "archieved", "deleted"],
        // defaultValue: "published",
      },

      showLikes: {
        type: Sequelize.BOOLEAN, 
        allowNull: false,
        defaultValue: true,
        // type: Sequelize.ENUM("0", "1"),
        // defaultValue: "1"
      },
      showShareCount: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        // type: Sequelize.ENUM("0", "1"),
        // defaultValue: "1",
      },
      allowComments: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        // type: Sequelize.ENUM("0", "1"),
        // defaultValue: "1",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
      
    },);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("posts","type",{type:Sequelize.ENUM("post","reel","prompt","story")});
  },
};
