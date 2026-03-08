const { User, relationship, post } = require("../models");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/ApiError");
const { Op, literal, where } = require("sequelize");

const searchProfiles = async (req, res, next) => {
  try {
    const data = await User.findAll({
      where: {
        username: { [Op.like]: `${req.params.query}%` }
        ,
      },
      raw: true,
    });

    const profiles = await Promise.all(
      data.map(async (raw) => {
        const cleanData = {};
        for (const key in raw) {
          if (key != "password" && key != "token") {
            cleanData[key] = raw[key];
          }
        }
        return {
          ...cleanData,
        };
      })
    );

    return res.status(200).send({
      success: true,
      data: profiles,
    });
  } catch (err) {
    return next(new ApiError(err));
  }
};

module.exports = { searchProfiles };
