"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      post.belongsTo(models.User, {
        as: "owner", 
        foreignKey: "userId",
      });
      post.belongsTo(models.relationship, {
        as: "relationFollower",
        foreignKey: "userId",
        targetKey: "followers",
      });
      post.hasMany(models.like,{
        as:"postLike",
        foreignKey:"postId"
      });
      post.hasMany(models.like,{
        as:"userLike",
        foreignKey:"postId"
      })
      post.hasMany(models.comment,{
        as:"postComment",
        foreignKey:"postId"
      })
      post.hasMany(models.promptPosts,{
        as:"promptPostsId",
        foreignKey:"postId"
      })
    }
  }
  post.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      media: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      type: {
        type: DataTypes.ENUM("post", "reel","story","prompt"),
        allowNull: false,
      },
      caption: {
        type: DataTypes.STRING(500),
      },
      location: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      tagPeople: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "published",
        validate: { isIn: [["published", "archived", "deleted", "private"]] },
        // type: Sequelize.ENUM,
        // values: ["published", "archieved", "deleted"],
        // defaultValue: "published",
      },

      showLikes: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        // type: Sequelize.ENUM("0", "1"),
        // defaultValue: "1"
      },
      showShareCount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        // type: Sequelize.ENUM("0", "1"),
        // defaultValue: "1",
      },
      allowComments: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        // type: Sequelize.ENUM("0", "1"),
        // defaultValue: "1",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "post",
       timestamps: true, 
      paranoid: true, 
    }
  );
  return post;
};
