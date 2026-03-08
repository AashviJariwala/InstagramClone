const jwt = require("jsonwebtoken");
const { User } = require("../models");

const verifyToken=(req,res,next)=>{
    try{    
    const bearerToken=req.headers.authorization;
    
    const token=bearerToken.split(' ')[1];
    if(!bearerToken || !bearerToken.startsWith("Bearer"))
        throw new Error("Invalid token");
    else{
        jwt.verify(token,process.env.JWT_KEY,async(err,decode)=>{
            if(err)
                throw new Error("Error in decoding");
            else
            {
                const verifyUser=await User.findOne({where:{email:decode.email}});
                if(verifyUser){ 
                    req.user=verifyUser.dataValues;
                    next();
                }   
                else
                {
                    throw new Error("No email id found");
                }
            }
        });
    }
    }catch(err){
        console.log(err);
        return res.status(500).send({error:err.errors[0].message});
    }
};
module.exports={verifyToken}