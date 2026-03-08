const {
  post,
  User,
  relationship,
  Sequelize,
  like,
  comment,
  dailyPrompts,
  promptPosts,
} = require("../models");
const { uploadOnCloud } = require("../helpers/helper");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/ApiError");
const { Op, literal, where } = require("sequelize");
const crypto = require("node:crypto");

let cachedPrompt = null;
let lastUpdated = null;

const getNewPrompt = async (req) => {
  console.log("get new prompt");

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms
  if (!cachedPrompt || !lastUpdated || now - lastUpdated > oneDay) {
    const randomNumber = crypto.randomInt(1, 500);
    const newPrompt = await dailyPrompts.findOne({
      where: { id: randomNumber },
    });
    global.promptSession = {};

    global.promptSession["promptId"] = newPrompt.id;
    if (!newPrompt) {
      throw new Error("Prompt not found");
    }
    cachedPrompt = newPrompt.dataValues.promptText;
    lastUpdated = now;
  }

  return cachedPrompt;
};

const sendPrompt = async (req, res, next) => {
  try {
    const promptText = await getNewPrompt(req);

    const promptId = global.promptSession["promptId"];
    return res.status(200).send({ success: true, msg: promptText });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const createPromptPost = async (req, res, next) => {
  try {
    const promptText = await getNewPrompt(req);

    const { caption, showLikes } = req.body;
    let type = "prompt";
    const userId = req.user.id;
    let status = "";
    if (req.user.is_private === "1") status = "private";
    else status = "published";

    const media = req.file;
    const data = {
      media,
      type,
    };
    const result = await uploadOnCloud(data);

    const create = await post.create({
      userId,
      media: result,
      type,
      caption,
      status,
      showLikes,
    });
    const insertPromptId = await promptPosts.create({
      promptId: global.promptSession["promptId"],
      postId: create.id,
    });

    const { tagPeople, location, ...cleanData } = create.dataValues;
    return res.status(200).send({
      success: true,
      promptData: {
        ...cleanData,
      },
    });
  } catch (err) {
    return next(new ApiError(err));
  }
};

function getLimitByPage(page) {
  switch (page) {
    case 1:
      return 0;
    case 2:
      return 1;
    case 3:
      return 6;
    // add more pages if needed
    default:
      return 10;
  }
}

const getOwnPromptPost = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit;
    let currentPage = page;
    const offset = getLimitByPage(page);
    const prompts = await post.findAll({
      where: { userId: req.user.id, type: "prompt" },
      offset,
      limit,
      attributes: {
        include: [
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postLike.id"))
            ),
            "likeCnt",
          ],
        ],
      },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username", "profile"],
        },
        {
          model: like,
          as: "postLike",
          attributes: [],
          required: false,
          where: { type: "prompt" },
        },
        {
          model: like,
          as: "postLike",
          attributes: ["id"],
          required: false,
          where: {
            userId: req.user.id,
            type: "prompt",
          },
        },
      ],
      group: ["post.id"], //like groupby
      raw: true,
    });
    const PromptData = await Promise.all(
      prompts.map(async (raw) => {
        const cleanPost = {};
        for (const key in raw) {
          if (
            !key.startsWith("owner.") &&
            key != "tagPeople" &&
            key != "location"
          ) {
            cleanPost[key] = raw[key];
          }
        }
        return {
          ...cleanPost,
          media: JSON.parse(raw.media),
          likeStatus: !!raw["postLike.id"],
          user: {
            username: raw["owner.username"],
            id: raw["owner.id"],
            profile: raw["owner.profile"],
          },
        };
      })
    );
    return res.status(200).send({ success: true, promptData: PromptData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

const getOtherPromptPost = async (req, res, next) => {
  try {
    const promptText = await getNewPrompt(req);

    console.log("prompt session id");

    const promptId = Number(global.promptSession["promptId"].toString().trim());
    console.log(promptId);
    console.log(typeof promptId);

    // const pp = await promptPosts.findAll({ where: { promptId } });
    // console.log(
    //   "PromptPosts found:",
    //   pp.length,
    //   pp.map((e) => e.dataValues)
    // );

    const page = parseInt(req.query.page) || 1;
    let likeStatus;
    let currentPage = page;

    //   where: {
    //     userId: { [Op.ne]: req.user.id },
    //     type: "prompt",
    //     [Op.or]: [{ status: "published" }, { status: "private" }],
    //   },
    //   attributes: {
    //     // include: [
    //   //     [
    //   //       Sequelize.fn(
    //   //         "COUNT",
    //   //         Sequelize.fn("DISTINCT", Sequelize.col("postLike.id"))
    //   //       ),
    //   //       "likeCnt",
    //   //     ],
    //   //   ],
    //   // },
    //   include: [
    //   //   {
    //   //     model: relationship,
    //   //     as: "relationFollower",
    //   //     required: false,
    //   //     where: {
    //   //       status: "accept",
    //   //       following: req.user.id,
    //   //     },
    //   //   },
    //   //   {
    //   //     model: User,
    //   //     as: "owner",
    //   //     attributes: ["id", "username", "profile"],
    //   //   },
    //     {
    //       model: promptPosts,
    //       as: "promptPostsId",
    //       attributes: [],
    //       required: true,
    //       where: { promptId },
    //     },
    //     // {
    //     //   model: like,
    //     //   as: "postLike",
    //     //   attributes: ["id"],
    //     //   required: false,
    //     //   where: { type: "prompt" },
    //     // },
    //   ],
    //   // group: ["post.id", "relationFollower.id", "owner.id"],
    //   // raw: true,
    // }
    // });

    const prompts = await post.findAll({where:{
      userId: { [Op.ne]: req.user.id },
      type: "prompt",
      [Op.or]: [
        { status: "published" }, // Public posts
        {
          status: "private", // Private posts, must match join
        },
      ]
    },

      attributes: {
        include: [
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postLike.id"))
            ),
            "likeCnt",
          ],
        ],
      },
      include: [
        {
          model: relationship,
          as: "relationFollower",
          required: false, // key change here
          where: {
            status: "accept",
            following: req.user.id,
          },
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "username", "profile"],
        },
        {
          model: promptPosts,
          as: "promptPostsId",
          attributes: [],
          where: { promptId: promptId },
        },
        {
          model: like,
          as: "postLike",
          userId: req.user.id,
          attributes: ["id"],
          required: false,
          where: {
            type: "prompt",
          },
        },
      ],

      group: ["post.id", "relationFollower.id", "owner.id"],
      having: {
        [Op.or]: [
          Sequelize.literal("post.status = 'published'"),
          Sequelize.literal("relationFollower.id IS NOT NULL"),
        ],
      },
      raw: true,
    });


    const PromptData = await Promise.all(
      prompts.map(async (raw) => {
        // const taggedIds = raw.tagPeople ? JSON.parse(raw.tagPeople) : [];

        // const taggedUsers = taggedIds.length
        //   ? await User.findAll({
        //       where: { id: { [Op.in]: taggedIds } },
        //       attributes: ["id", "username", "profile"],
        //       raw: true,
        //     })
        //   : [];

        const cleanPost = {};
        for (const key in raw) {
          if (
            !key.startsWith("relationFollower.") &&
            !key.startsWith("owner.") &&
            key != "tagPeople" &&
            key != "location"
          ) {
            cleanPost[key] = raw[key];
          }
        }

        return {
          ...cleanPost,
          // tagPeople: taggedUsers,  
          media: JSON.parse(raw.media),
          // location: JSON.parse(raw.location),
          likeStatus: !!raw["postLike.id"],
          user: {
            id: raw["owner.id"],
            username: raw["owner.username"],
            profile: raw["owner.profile"],
          },
        };
      })
    );

    return res.status(200).send({ success: true, promptData: PromptData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

module.exports = {
  getNewPrompt,
  createPromptPost,
  getOwnPromptPost,
  getOtherPromptPost,
  sendPrompt,
};
