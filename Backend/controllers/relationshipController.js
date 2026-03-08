const { User, relationship } = require("../models");
const { Op, where, Sequelize, or } = require("sequelize");
const ApiError = require("../utils/ApiError");

const sendRequest = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    let status = "";
    const follower = await User.findOne({ where: { id: userId } });
    if (follower.is_private == "0") {
      status = "accept";
    } else status = "pending";

    const following = req.user.id;
    await relationship.create({ following, followers: follower.id, status });
    return res
      .status(200)
      .send({ success: true, msg: "Request successfully sent" });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const pendingRequestList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; //no of records per page
    const offset = (page - 1) * limit; //no of records to skip
    let count;
    ({ count, rows } = await relationship.findAndCountAll({
      where: { followers: req.user.id, status: "pending" },
      include: {
        model: User,
        as: "followingUsers",
        attributes: ["id", "fullName", "profile", "username"],
      },
      limit,
      offset,
    }));
    const data = rows.map((row) => {
      return row.followingUsers.get({ plain: true });
    });
    const totalPages = Math.ceil(count / limit);

    return res.status(200).send({
      success: true,
      data: data,
      totalRecords: count,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const acceptRequest = async (req, res, next) => {
  try {
    const uid = req.params.uid;
    await relationship.update(
      { status: "accept" },
      {
        where: {
          [Op.and]: [
            { following: uid },
            { followers: req.user.id },
            { status: "pending" },
          ],
        },
      }
    );
    return res.status(200).send({ success: true, msg: "Request accepted" });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const uid = req.params.uid;
    await relationship.update(
      { status: "reject", deletedAt: Date.now() },
      {
        where: {
          [Op.and]: [
            { following: uid },
            { followers: req.user.id },
            { status: "pending" },
          ],
        },
      }
    );
    return res.status(200).send({ success: true, msg: "Request rejected" });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const unfollowUser=async (req, res, next) => {
  try {
    const uid = req.params.uid;
    await relationship.destroy(
      {
        where: {
          [Op.and]: [
            { following: req.user.id },
            { followers: uid },
            { status: "accept" },
          ],
        },
      }
    );
    return res.status(200).send({ success: true, msg: "User unfollowed" });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const getAcceptedRequestList = async (req, res, next) => {
  try {
    const requests = await relationship.findAll({
      where: {
        followers: req.user.id,
        status: "accept",
      },
      attributes: ["status"],
      include: {
        model: User,
        as: "followingUsers",
        attributes: ["id", "fullName", "profile", "username"],
      },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const requestData = await Promise.all(
      requests.map(async (raw) => {
        
        const isFollowBack = await relationship.findOne({
          where: {
            followers: raw["followingUsers.id"],
            status: "pending",
            following: req.user.id,
          },
          raw:true
        });

        const isFollowing = await relationship.findOne({
          where: {
            following: req.user.id,
            status: "accept",
            followers: raw["followingUsers.id"],
          },
          raw:true
        });
        return {
          
          id: raw["followingUsers.id"],
          username: raw["followingUsers.username"],
          profile: raw["followingUsers.profile"],
          fullName: raw["followingUsers.fullName"],
          status: isFollowBack?"requested":(isFollowing?"following":"")
        };
      })
    );
    
    return res.status(200).send({ success: true, data: requestData });
  } catch (err) {
    return next(new ApiError(err));
  }
};
const getFollowingFollowersList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; //no of records per page
    const offset = (page - 1) * limit; //no of records to skip
    let data = [];
    let count;
    if (req.params.status === "follower") {
      ({ count, rows } = await relationship.findAndCountAll({
        where: { status: "accept", following: req.user.id },
        include: {
          model: User,
          as: "followerUsers",
          attributes: ["id", "fullName", "profile", "username"],
        },
        limit,
        offset,
      }));
      data = rows.map((row) => {
        return row.followerUsers.get({ plain: true });
      });
    } else {
      ({ count, rows } = await relationship.findAndCountAll({
        where: { status: "accept", followers: req.user.id },
        include: {
          model: User,
          as: "followingUsers",
          attributes: ["id", "fullName", "profile", "username"],
        },
        limit,
        offset,
      }));
      data = rows.map((row) => {
        return row.followingUsers.get({ plain: true });
      });
    }
    const totalPages = Math.ceil(count / limit);
    return res.status(200).send({
      success: true,
      data,
      totalRecords: count,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    return next(new ApiError(err));
  }
};

const suggestProfiles = async (req, res, next) => {
  const users = await User.findAll({
    where: { is_private: "0", id: { [Op.ne]: req.user.id } },
    subQuery: false, //wraps the group by and order by in one container and then applies limit to it
    attributes: {
      include: [
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN followerUsers.followers = User.id THEN followerUsers.followers END"
            )
          ),
          "followersCnt",
        ],
      ],
    },
    include: {
      model: relationship,
      as: "followerUsers",
      attributes: [],
    },
    group: ["User.id"],
    order: [["followersCnt", "DESC"]],
    limit: 5,
  });

  const data = users.map((u) => {
    const result = {
      id: u.id,
      profile: u.profile,
      username: u.username,
      fullName: u.fullName,
    };
    return result;
  });

  res.status(200).send({ success: true, data: data });
};

module.exports = {
  sendRequest,
  getFollowingFollowersList,
  pendingRequestList,
  acceptRequest,
  suggestProfiles,
  deleteRequest,
  getAcceptedRequestList,
  unfollowUser
};
