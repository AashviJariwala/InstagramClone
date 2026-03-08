const { User, relationship, post } = require("../models");
const cloudinary = require("cloudinary");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/ApiError");
const { Op, literal, where } = require("sequelize");

const editProfile = async (req, res, next) => {
  try {
    if (req.user.profile) {
      const result = await cloudinary.v2.uploader.destroy(req.user.profile);
    }
    const uniqueFileName = uuidv4();
    console.log(uniqueFileName);
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await cloudinary.v2.uploader.upload(dataURI, {
      folder: "ProfilePhoto",
      public_id: uniqueFileName,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: "image",
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "thumb",
          gravity: "face",
          radius: "max",
        },
      ],
    });
    const imageUrl = cloudinary.url(result.public_id);
    const update = await User.update(
      {
        profile: imageUrl,
      },
      { where: { email: req.user.email } }
    );
    return res.status(200).send({
      success: true,
      msg: "Profile Updated",
      data: { profile: imageUrl },
    });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    const { fullName, username, bio, gender } = req.body;
    if (
      (!req.user.phone_number && req.body.phone_number) ||
      !req.body.phone_number
    ) {
      console.log(req.user.email);

      const [update, data] = await User.update(
        {
          fullName,
          username,
          bio,
          gender,
        },
        { where: { email: req.user.email }, individualHooks: true }
      );
      console.log(data[0].dataValues.password);
      const { password, token, ...cleanData2 } = data[0].dataValues;
      return res
        .status(200)
        .send({ success: true, msg: "User details Updated", data: cleanData2 });
    } else {
      return res
        .status(502)
        .send({ success: false, msg: "Phone number cannot be changed" });
    }
  } catch (err) {
    console.log(err);

    return next(new ApiError(err));
  }
};

const showPrivacyStatus = async (req, res, next) => {
  try {
    const data = await User.findOne({
      where: { id: req.user.id },
      attributes: ["is_private"],
    });
    return res.status(200).send({ success: true, data });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const updatePrivacyStatus = async (req, res, next) => {
  try {
    const is_private = req.params.is_private;
    await User.update({ is_private }, { where: { id: req.user.id } });
    return res
      .status(200)
      .send({ success: true, msg: "Privacy Status Updated" });
  } catch (err) {
    console.log(err.message);

    return next(new ApiError(err));
  }
};

//when we click on user profile
const findUserById = async (id, userId) => {
  try {
    var status1 = "";
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: relationship,
          as: "followerUsers",
          required: false,
          attributes: ["id", "status"],
          where: {  following: userId ,followers: id}, //follow or requested
        },
        {
          model: relationship,
          as: "followingUsers",
          required: false,
          attributes: ["id"],
        },
        {
          model: post,
          as: "owner",
          attributes: ["id"],
          required: false,
          where: { type: { [Op.ne]: "story" } },
        },
      ],
    });

    const { password, token, ...userData } = user.dataValues; 
    ({ count, rows } = await relationship.findAndCountAll({
      where: { following: userId, followers: id },
    }));
    if (count == 0)
    { 
        ({count,rows}=await relationship.findAndCountAll({where:{following:id,followers:userId,status:"accept"}}));
        if(count==1)
          status1="follow back"
        else
          status1 =(user.dataValues.followerUsers.length == 0)? null:user.dataValues.followerUsers[0].dataValues.status ;
    }
    else{
        console.log("thissssssss");
        status1 =(user.dataValues.followerUsers.length == 0)? null:user.dataValues.followerUsers[0].dataValues.status ;
    }

    return {
      userData,
      status: status1,
      followersCount: userData.followerUsers
        ? userData.followerUsers.length
        : 0,
      followingCount: userData.followingUsers
        ? userData.followingUsers.length
        : 0,
      postCount: userData.owner ? userData.owner.length : 0,
    };
  } catch (err) {
    console.log(err.message);
  }
};
//to get other user profile using findUserById function

const searchUser = async (req, res, next) => {
  try {
    const data = await findUserById(req.params.id, req.user.id);

    return res.status(200).send({
      success: true,
      data: data.userData,
      status: data.status,
      followingCount: data.followingCount,
      followersCount: data.followersCount,
      postCount: data.postCount,
    });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const searchOwnProfile = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (id == req.user.id) {
      console.log(id);

      return res.status(200).send({ success: true, msg: "Token User" });
    } else {
      console.log("else");

      return res.status(200).send({ success: true, msg: "Other User" });
    }
  } catch (err) {
    return next(new ApiError(err));
  }
};

//to get own profile using findUserById function
const userProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: relationship,
          as: "followerUsers",
          required: false,
          attributes: ["id"],
        },
        {
          model: relationship,
          as: "followingUsers",
          required: false,
          attributes: ["id"],
        },
        {
          model: post,
          as: "owner",
          attributes: ["id"],
          required: false,
          where: { type: { [Op.ne]: "story" } },
        },
      ],
    });

    const { password, token, ...userData } = user.dataValues;

    const data1 = {
      userData,
      followersCount: userData.followerUsers
        ? userData.followerUsers.length
        : 0,
      followingCount: userData.followingUsers
        ? userData.followingUsers.length
        : 0,
      postCount: userData.owner ? userData.owner.length : 0,
    };

    return res.status(200).send({
      success: true,
      data: data1.userData,
      followingCount: data1.followingCount,
      followersCount: data1.followersCount,
      postCount: data1.postCount,
    });
  } catch (err) {
    return next(new ApiError(err));
  }
};
module.exports = {
  editProfile,
  updateUserDetails,
  showPrivacyStatus,
  updatePrivacyStatus,
  searchUser,
  userProfile,
  searchOwnProfile,
};
