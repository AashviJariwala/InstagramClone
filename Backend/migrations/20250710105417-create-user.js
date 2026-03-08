'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull:true
      },
      username: {
        type: Sequelize.STRING,
        allowNull:false,
        unique:true
      },
      gender: {
        type: Sequelize.ENUM("male","female","other","prefer not to say"),
        allowNull:true
      },
      profile: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull:true
      },
      phone_number: {
        type: Sequelize.STRING(50),
        allowNull:true
      },
      dob:{
        type:Sequelize.DATEONLY,
        allowNull:true
      },
      password: {
        type: Sequelize.STRING,
        allowNull:false
      },
      is_verified: {
        type: Sequelize.ENUM("0","1"),
        allowNull:true
      },
      is_private: {
        type: Sequelize.ENUM("0","1"),
        allowNull:true
      },
      is_status: {
        type: Sequelize.ENUM("0","1"),
        allowNull:true
      },
      token:{
        type: Sequelize.TEXT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};