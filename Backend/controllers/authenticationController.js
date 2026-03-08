const bcrypt = require("bcryptjs");
const { User, pendinguser } = require("../models");
const crypto = require("node:crypto");
const { Op, literal } = require("sequelize");
const { sendMail, generateToken } = require("../helpers/helper");
const ApiError = require("../utils/ApiError");

function generateOTP() {
  return crypto.randomInt(10000, 99999);
}
  
const registerDummy = async (req, res, next) => {
  try {
    const { username, password, email, phoneNumber } = req.body;
    const user = await User.findOne({ where: { username } });
    if (user) {
      const err = "Username already exists.Try another one";
      return next(new ApiError(err));
    }
    const otp = generateOTP();
    console.log("otp otp otp otp", otp);
    sendMail(email, otp);
    const expiresAt = Date.now() + 1 * 60 * 60 * 1000;
    await pendinguser.create({
      username,
      email,
      phoneNumber,
      password,
      otp,
      expiresAt,
    });
    return res
      .status(200)
      .send({ success: true, msg: "OTP successfully sent" });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const emailExist = await pendinguser.findOne({
      where: { email: req.body.email },
    });

    if (Date.now() > emailExist.expiresAt) {
      return res.status(500).send({ msg: "OTP Time expired " });
    } else {
      const hashedOtp = await bcrypt.compare(req.body.otp, emailExist.otp);
      if (!hashedOtp) {
        return res.status(500).send({ success: false, msg: "Invalid OTP" });
      } else {
        const { id, ...cleanData } = emailExist.dataValues;
        const newUser = await User.create({
          ...cleanData,
        });
        const token = generateToken(req.body.email, newUser.id);
        newUser.token = token;
        await newUser.save();
        await pendinguser.destroy({ where: { email: req.body.email } });
        return res
          .status(200)
          .send({ success:true,msg: "User registered successfully", token });
      }
    }
  } catch (err) {
    return next(new ApiError(err));
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const emailExist = await pendinguser.findOne({
      where: { email: req.body.email },
    });
    const otp = generateOTP();
    console.log("otp otp otp otp", otp);
    sendMail(req.body.email, otp);
    const expiresAt = Date.now() + 1 * 60 * 60 * 1000;
    await pendinguser.update(
      {
        otp,
        expiresAt,
      },
      { where: { email: req.body.email }, individualHooks: true }
    );
    return res
      .status(200)
      .send({ success: true, msg: "OTP successfully sent" });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const login = async (req, res, next) => {
  try {
    const data = req.body.data;
    const pass = req.body.pass;
    const checkUser = await User.findOne({
      where: {
        [Op.or]: [{ email: data }, { phone_number: data }, { username: data }],
      },
      attributes: {
        include: [
          [
            literal(
              `(SELECT COUNT(*) FROM relationships WHERE followers = User.id)`
            ),
            "followingUsers",
          ],
          [
            literal(
              `(SELECT COUNT(*) FROM relationships WHERE following = User.id)`
            ),  
            "followerUsers",
          ],
        ],
      },
    });
    if (checkUser) {
      const hashedpass = await bcrypt.compare(pass, checkUser.password);
      if (!hashedpass) {
        return res
          .status(500)
          .send({ success: false, msg: "Invalid Password" });
      } else {
        const tokens = generateToken(checkUser.email, checkUser.id);
        checkUser.token = tokens;
        await checkUser.save();
        const { password, token, ...cleanData } = checkUser.dataValues;
        return res.status(200).send({
          success: true,
          msg: "Login successfully",
          token: tokens,
          data: cleanData,
        });
      }
    } else {
      return res.status(404).send({ success: false, msg: "User not found" });
    }
  } catch (err) {
    return next(new ApiError(err));
  }
};

const logout = async (req, res, next) => {
  try {
    const destroyToken = await User.update(
      { token: null },
      { where: { email: req.user.email } }
    );
    return res.status(200).send({ success: true, msg: "Logout Successfully" });
  } catch (err) {
    return next(new ApiError(err));
  }
};
module.exports = { registerDummy, verifyOtp, resendOtp, login, logout };
