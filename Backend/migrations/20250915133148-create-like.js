'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      postId: {
        type: Sequelize.BIGINT,
        references:{
          model:"posts",
          key:"id"
        }
      },
      userId:{
        type:Sequelize.BIGINT,
        references:{
          model:"users",
          key:"id"
        }
      },
      commentId:{
        type: Sequelize.BIGINT,
        references:{
          model:"comments",
          key:"id"
        }
      },    
      type:{
        type:Sequelize.ENUM("post","reel","story","prompt","comment"),
        defaultValue:"post"
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
    await queryInterface.changeColumn("likes","type",{
      type:Sequelize.ENUM("post","reel","story","prompt","comment")
      }
    )
  }
};