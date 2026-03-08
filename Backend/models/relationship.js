"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class relationship extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      relationship.belongsTo(models.User, {
        as: "followerUsers",
        foreignKey: "followers",
      });
      relationship.belongsTo(models.User, {
        as: "followingUsers",
        foreignKey: "following",
      });
      //  relationship.hasMany(models.post,{
      //   as:"followerUser",
      //   foreignKey:"userId"
      //  })
    }
  }
  relationship.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      following: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      followers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "accept", "reject"),
        allowNull: false,
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
      modelName: "relationship",
    }
  );
  return relationship;
};
