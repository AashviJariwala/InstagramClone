const {Sequelize}=require("sequelize");
require("dotenv").config();
const {DB_HOST,DB_USER,DB_PASS,DB_NAME}=process.env;

const con=new Sequelize(DB_NAME,DB_USER,DB_PASS,{
    host:DB_HOST,
    dialect:"mysql" 
});

con.authenticate().then((err,res)=>{
    if(err)
        console.log(err);
    else
        console.log("Connection successful");
});

module.exports=con;