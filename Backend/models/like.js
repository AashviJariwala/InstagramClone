'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      like.belongsTo(models.post, {
        as: "postLike",
        foreignKey: "postId",
      });
      like.belongsTo(models.post, {
        as: "userLikes",
        foreignKey: "postId",
      });
      like.belongsTo(models.User,{
        as:"userLike",
        foreignKey:"userId"
      });
      like.belongsTo(models.comment,{
        as:"commentLike",
        foreignKey:"commentId"
      });
    }
  }
  like.init({
        id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      postId: {
        type: DataTypes.INTEGER,
        references:{
          model:"posts",
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
      commentId:{
        type: DataTypes.INTEGER,
        references:{
          model:"comments",
          key:"id"
        }
      },    
      type:{
        type:DataTypes.ENUM("post","comment"),
        defaultValue:"post"
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
  }, {
    sequelize,
    modelName: 'like',
  });
  return like;
};