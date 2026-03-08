'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class promptPosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      promptPosts.belongsTo(models.post, {
        as: "promptPostsId",
        foreignKey: "postId",
      });    
     promptPosts.belongsTo(models.dailyPrompts, {
        as: "dailypromptsId",
        foreignKey: "promptId",
      });    
    }
  }
  promptPosts.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      promptId: {
        type: DataTypes.INTEGER,
         references:{
          model:"dailyPrompts",
          key:"id"
        }
      },
      postId:{
        type: DataTypes.INTEGER,
        references:{
          model:"posts",
          key:"id"
        }
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      deletedAt: {
        type: DataTypes.DATE
      }
  }, {
    sequelize,
    modelName: 'promptPosts',
  });
  return promptPosts;
};