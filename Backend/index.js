const express = require("express");
require("dotenv").config();
require("./config/mycon");
const morgan=require("morgan");
const session=require("express-session");
const cloudinary=require("cloudinary");
const {errorHandler}=require("./middleware/errorHandler");
const {cleanStories}=require("./jobs/cleanUpStories");
const {cleanPrompts}=require("./jobs/cleanUpPrompts");

const authenticationRoutes = require("./routes/authenticationRoutes");
const userRoutes = require("./routes/userRoutes");
const relationshipRoutes = require("./routes/relationshipRoutes");
const postRoutes = require("./routes/postRoutes");
const likeCommentControllerRoutes = require("./routes/likeCommentControllerRoutes");
const storyRoutes = require("./routes/storyRoutes");
const spinPromptRoutes = require("./routes/spinPromptRoutes");
const searchRoutes = require("./routes/searchRoutes");


const cors=require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(session({
  saveUninitialized:false,
  resave:true,
  secret:process.env.SESSION_SECRET
}))
app.use("/api", authenticationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/relationship", relationshipRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/story",storyRoutes);
app.use("/api/likeComment", likeCommentControllerRoutes);  
app.use("/api/spinPrompt", spinPromptRoutes);  
app.use("/api/search",searchRoutes);  




cloudinary.config({
  cloud_name:process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret:process.env.api_secret,
});


app.use(errorHandler);
cleanStories();
cleanPrompts();
app.listen(3000,"0.0.0.0",() => console.log("Server running on post 3000"));
