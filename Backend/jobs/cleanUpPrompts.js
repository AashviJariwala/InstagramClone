const cron = require("node-cron");
const { post } = require("../models");
const { Op } = require("sequelize");

exports.cleanPrompts = () => {

  cron.schedule("0 * * * *", async () => {
    try {
      const now = new Date();
      const cutoff = new Date(now - 24 * 60 * 60 * 1000);

      // Debug list
      const prompts = await post.findAll({
        where: { type: "prompt" },
        attributes: ["id", "createdAt", "deletedAt"],
        raw: true,
        paranoid: false,
      });

      prompts.forEach(s => {
        const age = ((now - new Date(s.createdAt)) / 3600000).toFixed(2);
      });

      // Update old stories (soft delete)
      const [affected] = await post.update(
        { deletedAt: new Date() },
        {
          where: {
            type: "prompt",
            createdAt: { [Op.lte]: cutoff },
            deletedAt: null, // only not-deleted ones
          },
          paranoid: false,
        }
      );

      console.log("Prompts cleaned up");
      
    } catch (err) {
      console.error(" Error in cleanup cron:", err);
    }
  });
};
