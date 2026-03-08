'use strict';
const bcrypt=require("bcryptjs");
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class pendinguser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  pendinguser.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    email:{
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: {
        msg: "Email id should be unique",
      },
      validate: {
        isEmail: true,
      },
    },
    phoneNumber:{
      type: DataTypes.STRING(10),
      allowNull: true,
      unique: true,
      validate: {
        isNumeric: true,
      },
    },
    password:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp:{
      type:DataTypes.STRING(100),
      allowNull:false
    },
    expiresAt:{
      type:DataTypes.DATE,
      allowNull:false
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
    modelName: 'pendinguser',
    hooks:{
      beforeCreate:async (pendinguser,options)=>{
        if(pendinguser.password)
          pendinguser.password=await bcrypt.hash(pendinguser.password,10);
        if(pendinguser.otp)
          pendinguser.otp=await bcrypt.hash(pendinguser.otp.toString(),10);
      },
      beforeUpdate:async (pendinguser,options)=>{
        if(pendinguser.password)
          pendinguser.password=await bcrypt.hash(pendinguser.password,10);
        if(pendinguser.otp)
          pendinguser.otp=await bcrypt.hash(pendinguser.otp.toString(),10);
      }
    }

  });
  return pendinguser;
};