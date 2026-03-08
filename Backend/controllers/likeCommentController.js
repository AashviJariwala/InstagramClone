const { post, User, like, comment } = require("../models");
const ApiError = require("../utils/ApiError");

const likePost = async (req, res, next) => {
  try {
    const { postId, type } = req.body;
    let newLike;
    let likeStatus;
    const likeExist = await like.findOne({
      where: { postId, userId: req.user.id, commentId: null },
    });
    if (likeExist) {
      likeStatus = false;
      await like.destroy({
        where: { postId, userId: req.user.id, commentId: null },
      });
    } else {
      likeStatus = true;
      newLike = await like.create({ postId, userId: req.user.id, type });
    }

    const likeCnt = await like.count({
      where: { postId, type },
    });

    const data = {
      likeCnt,
      likeStatus,
    };
    return res.status(200).send({ success: true, likeData: data });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const likeComment = async (req, res, next) => {
  try {
    const { postId, commentId, type } = req.body;
    const newLike = await like.create({
      postId,
      userId: req.user.id,
      commentId,
      type,
    });

    const commentCnt = await like.count({
      where: { postId, type: "comment", commentId },
    });

    const data = {
      newLike,
      commentCnt,
    };
    return res.status(200).send({ success: true, data: data });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const commentPost = async (req, res, next) => {
  try {
    const { commentText, postId } = req.body;
    const newComment = await comment.create({
      commentText,
      postId,
      userId: req.user.id,
    });

    const comments = await comment.findOne({
      where: { id: newComment.id },
      include: [
        {
          model: User,
          as: "userComment",
          attributes: ["id", "username", "profile"],
        },
      ],
      raw:true
    });
    
    const data = {
      id: comments.id,
      commentText: comments.commentText,
      user: {
        id: comments["userComment.id"],
        username: comments["userComment.username"],
        profile: comments["userComment.profile"],
      },
    };
    return res.status(200).send({ success: true, comment: data });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const comments = await comment.findAll({
      where: { postId: req.params.id },
      include: [
        {
          model: User,
          as: "userComment",
          attributes: ["id", "username", "profile"],
        },
      ],
      raw: true,
    });
    const data = await Promise.all(
      comments.map(async (raw) => {
        const cleanData = {};
        for (const key in raw) {
          if (
            key != "postId" &&
            key != "userId" &&
            !key.startsWith("userComment")
          ) {
            cleanData[key] = raw[key];
          }
        }
        return {
          ...cleanData,
          user: {
            id: raw["userComment.id"],
            username: raw["userComment.username"],
            profile: raw["userComment.profile"],
          },
        };
      })
    );
    return res.status(200).send({ success: true, comments: data });
  } catch (err) {
    return next(new ApiError(err));
  }
};

module.exports = { likePost, commentPost, likeComment, getPostComments };
