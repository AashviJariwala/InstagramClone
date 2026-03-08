const { post, User, relationship } = require("../models");
const { uploadOnCloud } = require("../helpers/helper");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/ApiError");
const { Op, literal } = require("sequelize");

const storyStatus = async (req, res, next) => {
  try {
    const stories = await post.findOne({
      where: { userId: req.user.id, type: "story" },
      paranoid: false,
      order: [["createdAt", "DESC"]],
    });
    if (stories != null)
      return res
        .status(200)
        .send({ success: true, storyData: { id: stories.id } });
    else return res.status(200).send({ success: true, storyData: { id: 0 } });
  } catch (err) {
    return next(new ApiError(err));
  }
};
const uploadStory = async (req, res, next) => {
  try {
    const type = "story";
    const { tagPeople, allowComments } = req.body;
    const media = req.file;
    const data = {
      media,
      type,
    };
    const result = await uploadOnCloud(data);
    const taggedPeople = tagPeople ? JSON.parse(tagPeople) : null;
    const newStory = await post.create({
      media: result,
      tagPeople: taggedPeople,
      allowComments,
      type,
      userId: req.user.id,
    });
    return res.status(200).send({ success: true, msg: "Story Uploaded" });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const getAllStory = async (req, res, next) => {
  try {
    const stories = await post.findAll({
      where: {
        type: "story",
        deletedAt: null,
        userId: { [Op.ne]: req.user.id },
      },
      include: [
        {
          model: relationship,
          required: true, // key change here
          as: "relationFollower",
          where: {
            following: req.user.id,
            status: "accept",
          },
          attributes: ["id"],
        },
        {
          model: User,
          as: "owner",
          attributes: ["username", "profile", "id", "fullName"],
        },
      ],
      raw: true,
    });
    const storyData = await Promise.all(
      stories.map(async (raw) => {
        const cleanData = {};
        for (const key in raw) {
          if (
            !key.startsWith("owner") &&
            key != "tagPeople" &&
            key != "location"
          ) {
            cleanData[key] = raw[key];
          }
        }
        return {
          ...cleanData,
          media: JSON.parse(raw.media),
          user: {
            id: raw["owner.id"],
            username: raw["owner.username"],
            profile: raw["owner.profile"],
            fullName: raw["owner.fullName"],
          },
        };
      })
    );

    return res.status(200).send({ success: true, stories: storyData });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const getUserStory = async (req, res, next) => {
  try {
    console.log(req.params.id);

    const story = await post.findOne({
      where: { id: req.params.id, deletedAt: null },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["username", "profile", "id", "fullName"],
        },
      ],
      raw: true,
    });

    const storyData = () => {
      const {
        tagPeople,
        location,
        showShareCount,
        allowComments,
        username,
        profile,
        ...stories
      } = story;

      delete stories["owner.username"];
      delete stories["owner.profile"];
      delete stories["owner.id"];
      delete stories["owner.fullName"];

      return {
        ...stories,
        media: JSON.parse(story.media),
        user: {
          id: story["owner.id"],
          username: story["owner.username"],
          profile: story["owner.profile"],
          fullName: story["owner.fullName"],
        },
      };
    };
    const userStories = storyData();
    return res.status(200).send({ success: true, storyData: userStories });
  } catch (err) {
    return next(new ApiError(err));
  }
};

module.exports = { uploadStory, getAllStory, getUserStory, storyStatus };
