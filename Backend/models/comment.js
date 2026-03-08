'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      comment.belongsTo(models.post, {
        as: "postComment",
        foreignKey: "postId",
      });
      comment.belongsTo(models.User,{
        as:"userComment",
        foreignKey:"userId"
      });
    }
  }
  comment.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      commentText: {
        type: DataTypes.STRING,
        model:"posts",
      },
      postId: {
        type: DataTypes.INTEGER,
        references:{
          key:"id"
        }
      },
      userId:{
        type:DataTypes.INTEGER,
        references:{
          model:"users",
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
    modelName: 'comment',
  });
  return comment;
};