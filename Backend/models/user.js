"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.relationship, {
        as: "followerUsers",
        foreignKey: "followers",
      });
      User.hasMany(models.relationship, {
        as: "followingUsers",
        foreignKey: "following",
      });
      User.hasMany(models.post,{
        as:"owner",
        foreignKey:"userId"
      });
      User.hasMany(models.like,{
        as:"userLike",
        foreignKey:"userId"
      });
      User.hasMany(models.comment,{
        as:"userComment",
        foreignKey:"userId"
      })
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 50],
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
        },
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other", "prefer not to say"),
        allowNull: true,
        defaultValue: "prefer not to say",
      },
      profile: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: {
          msg: "Email id should be unique",
        },
        validate: {
          isEmail: true,
        },
      },
      phone_number: {
        type: DataTypes.STRING(10),
        allowNull: true,
        unique: true,
        validate: {
          isNumeric: true,
        },
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_verified: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: true,
        defaultValue: "0",
      },
      is_private: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: true,
        defaultValue: "0",
      },
      is_status: {
        type: DataTypes.ENUM("0", "1"),
        allowNull: true,
        defaultValue: "0",
      },
      token: {
        type: DataTypes.TEXT,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        beforeUpdate: async (User, options) => {
          if(User.email!=null)
          {
            if (User.changed("email")) {
              throw new Error("Email id cannot be changed");
            }
          }
        },
      },
    }
  );
  return User;
};
