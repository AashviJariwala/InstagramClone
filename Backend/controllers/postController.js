const {
  post,
  User,
  relationship,
  Sequelize,
  like,
  comment,
} = require("../models");
const { uploadOnCloud } = require("../helpers/helper");
const { v4: uuidv4 } = require("uuid");
const ApiError = require("../utils/ApiError");
const { Op, literal } = require("sequelize");

const createPost = async (req, res, next) => {
  try {
    const {
      caption,
      locationName,
      lat,
      long,
      tagUsers,
      showLikes,
      allowComments,
      showShareCount,
    } = req.body;

    let type = "";
    const userId = req.user.id;
    let status = "";
    if (req.user.is_private === "1") status = "private";
    else status = "published";

    //promise data returns secure which cannot be used outside the block to access use promise.all function
    const media = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadOnCloud(file);
        return result;
      })
    );
    
    if (media.length == 1 && media[0].resourceType == "video") {
      type = "reel";
    } else type = "post";
    const location = {
      name: locationName,
      lat,
      long,
    };
    const create = await post.create({
      userId,
      media,
      type,
      caption,
      // location,
      // tagPeople: JSON.parse(tagUsers),
      status,
      showLikes,
      // showShareCount,
      allowComments,
    });

    // const tagUserInfo = await Promise.all(
    //   create.dataValues.tagPeople.map(async (id) => {
    //     const result = await User.findOne({
    //       where: { id },
    //       attributes: ["id", "username", "profile"],
    //     });
    //     return result.dataValues;
    //   })
    // );

    return res.status(200).send({
      success: true,
      postData: {
        ...create.dataValues,
        // tagPeople: tagUserInfo,
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
const getOtherPost = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let likeStatus;
    // let limit;
    // console.log(limit);

    let currentPage = page;
    // const offset = getLimitByPage(page);

    const posts = await post.findAll({
      where: {
        userId: { [Op.ne]: req.user.id },
        type: "post",
        [Op.or]: [
          { status: "published" }, // Public posts
          {
            status: "private", // Private posts, must match join
          },
        ],
      },
      // offset,
      // limit,
      attributes: {
        include: [
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postLike.id"))
            ),
            "likeCnt",
          ],
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postComment.id"))
            ),
            "commentCnt",
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
          model: like,
          as: "postLike",
          attributes: [],
          required: false,
          where: { type: "post" },
        },
        {
          model: comment,
          as: "postComment",
          required: false,
          attributes: [],
        },
        {
          model: like,
          as: "postLike",
          attributes: ["id"],
          required: false,
          where: {
            userId: req.user.id,
            type: "post",
          },
        },
      ],

      // Only group if really needed
      group: ["post.id"], //like groupby
      group: ["post.id", "relationFollower.id", "owner.id"],
      having: {
        [Op.or]: [
          literal(`\`post\`.\`status\` = 'published'`),
          literal(`\`relationFollower\`.\`id\` IS NOT NULL`),
        ],
      },
      raw: true,
    });
    const PostData = await Promise.all(
      posts.map(async (raw) => {
        const taggedIds = raw.tagPeople ? JSON.parse(raw.tagPeople) : [];

        const taggedUsers = taggedIds.length
          ? await User.findAll({
              where: { id: { [Op.in]: taggedIds } },
              attributes: ["id", "username", "profile"],
              raw: true,
            })
          : [];

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

    return res.status(200).send({ success: true, data: PostData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

const getOtherReel = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;

    // let limit;
    // console.log(limit);

    let currentPage = page;
    // const offset = getLimitByPage(page);

    const posts = await post.findAll({
      where: {
        userId: { [Op.ne]: req.user.id },
        type: "reel",
        [Op.or]: [
          { status: "published" }, // Public posts
          {
            status: "private", // Private posts, must match join
          },
        ],
      },
      // offset,
      // limit,
      attributes: {
        include: [
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postLike.id"))
            ),
            "likeCnt",
          ],
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postComment.id"))
            ),
            "commentCnt",
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
          model: like,
          as: "postLike",
          attributes: [],
          required: false,
          where: { type: "post" },
        },
        {
          model: comment,
          as: "postComment",
          required: false,
          attributes: [],
        },
        {
          model: like,
          as: "postLike",
          attributes: ["id"],
          required: false,
          where: {
            userId: req.user.id,
            type: "reel",
          },
        },
      ],

      // Only group if really needed
      group: ["post.id"], //like groupby
      group: ["post.id", "relationFollower.id", "owner.id"],
      having: {
        [Op.or]: [
          literal(`\`post\`.\`status\` = 'published'`),
          literal(`\`relationFollower\`.\`id\` IS NOT NULL`),
        ],
      },
      raw: true,
    });
    const PostData = await Promise.all(
      posts.map(async (raw) => {
        const taggedIds = raw.tagPeople ? JSON.parse(raw.tagPeople) : [];

        const taggedUsers = taggedIds.length
          ? await User.findAll({
              where: { id: { [Op.in]: taggedIds } },
              attributes: ["id", "username", "profile"],
              raw: true,
            })
          : [];

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
          likeStatus: !!raw["postLike.id"],
          // location: JSON.parse(raw.location),
          user: {
            id: raw["owner.id"],
            username: raw["owner.username"],
            profile: raw["owner.profile"],
          },
        };
      })
    );

    return res.status(200).send({ success: true, data: PostData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

const getUserPostById = async (id) => {
  try {
    const posts = await post.findAll({
      where: { userId: id, type: "post" },
      attributes: {
        include: [
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postLike.id"))
            ),
            "likeCnt",
          ],
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postComment.id"))
            ),
            "commentCnt",
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
          where: { type: "post" },
        },
        {
          model: comment,
          as: "postComment",
          required: false,
          attributes: [],
        },
        {
          model: like,
          as: "postLike",
          attributes: ["id"],
          required: false,
          where: {
            userId: id,
            type: "post",
          },
        },
      ],
      group: ["post.id"], //like groupby
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const PostData = await Promise.all(
      posts.map(async (raw) => {
        const taggedIds = raw.tagPeople ? JSON.parse(raw.tagPeople) : [];

        const taggedUsers = taggedIds.length
          ? await User.findAll({
              where: { id: { [Op.in]: taggedIds } },
              attributes: ["id", "username", "profile"],
              raw: true,
            })
          : [];

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
          // tagPeople: taggedUsers,
          media: JSON.parse(raw.media),
          likeStatus: !!raw["postLike.id"],

          // location: JSON.parse(raw.location),
          user: {
            id: raw["owner.id"],
            username: raw["owner.username"],
            profile: raw["owner.profile"],
          },
        };
      })
    );

    return PostData;
  } catch (err) {
    console.log(err);
  }
};
const getOwnPost = async (req, res, next) => {
  try {
    const PostData =await getUserPostById(req.user.id);
    
    return res.status(200).send({ success: true, data: PostData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

const getUserPost = async (req, res, next) => {
  try {
    const PostData =await getUserPostById(req.params.id);
    
    return res.status(200).send({ success: true, data: PostData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

const getUserReelById = async (id) => {
  try{
    const posts = await post.findAll({
      where: { userId: id, type: "reel" },
      attributes: {
        include: [
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postLike.id"))
            ),
            "likeCnt",
          ],
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.fn("DISTINCT", Sequelize.col("postComment.id"))
            ),
            "commentCnt",
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
          where: { type: "post" },
        },
        {
          model: comment,
          as: "postComment",
          required: false,
          attributes: [],
        },
        {
          model: like,
          as: "postLike",
          attributes: ["id"],
          required: false,
          where: {
            userId: id,
            type: "reel",
          },
        },
      ],
      group: ["post.id"], //like groupby
      raw: true,
    });

    
    const PostData = await Promise.all(
      posts.map(async (raw) => {
        const taggedIds = raw.tagPeople ? JSON.parse(raw.tagPeople) : [];

        const taggedUsers = taggedIds.length
          ? await User.findAll({
              where: { id: { [Op.in]: taggedIds } },
              attributes: ["id", "username", "profile"],
              raw: true,
            })
          : [];

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
          // tagPeople: taggedUsers,
          media: JSON.parse(raw.media),
          likeStatus: !!raw["postLike.id"],

          // location: JSON.parse(raw.location),
          user: {
            id: raw["owner.id"],
            username: raw["owner.username"],
            profile: raw["owner.profile"],
          },
        };
      })
    );

    return PostData;
  }catch (err) {
    console.log(err);
  }
}

const getOwnReel = async (req, res, next) => {
  try {
    const PostData =await getUserReelById(req.user.id);
    return res.status(200).send({ success: true, data: PostData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

const getUserReel = async (req, res, next) => {
  try {
    const PostData =await getUserReelById(req.params.id);
    return res.status(200).send({ success: true, data: PostData });
  } catch (err) {
    console.log(err);
    return next(new ApiError(err));
  }
};

module.exports = {
  createPost,
  getOtherPost,
  getOwnPost,
  getOwnReel,
  getOtherReel,
  getUserPost,
  getUserReelById,
  getUserReel
};
