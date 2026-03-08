const fs=require("fs");
const path=require("path");

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const filePath=path.join(__dirname,"promptTexts.json");
    const prompts=JSON.parse(fs.readFileSync(filePath,"utf8"));

    await queryInterface.bulkInsert("dailyPrompts",prompts,{})
  
    
  },

  async down (queryInterface, Sequelize) {
   
    await queryInterface.bulkDelete('dailyPrompts', null, {});

  }
};
