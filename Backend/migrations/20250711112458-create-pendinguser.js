'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pendingusers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email:{
        type:Sequelize.STRING,
        unique:true
      },
      phoneNumber:{
        type:Sequelize.STRING(10),
        unique:true
      },
      password:{
        type:Sequelize.STRING,
        allowNull: false,
      },
      otp:{
        type:Sequelize.STRING(100),
        allowNull:false
      },
      expiresAt:{
        type:Sequelize.DATE,
        allowNull:false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pendingusers');
  }
};