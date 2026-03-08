const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMail = async (email, otp) => {
  const mailOptions = {
    to: email,
    subject: "Instagram Messenger - Verify Your Email Address",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #24292e; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Instagram Messenger</h2>
          </div>
          <div style="padding: 30px; background-color: #ffffff; color: #333333;">
            <h3>Verify Your Email Address</h3>
            <p>Thank you for creating an account with <strong>Instagram Messenger</strong>.</p>
            <p>To continue, please verify your email address using the code below:</p>
            <div style="font-size: 28px; font-weight: bold; margin: 20px 0; text-align: center; color: #2c3e50;">
              ${otp}
            </div>
            <p>This code is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
            <br />
            <p style="font-size: 13px; color: #777777;">Instagram will never ask for your password, OTP, or credit card details via email.</p>
          </div>
          <div style="background-color: #f6f6f6; padding: 15px; font-size: 12px; text-align: center; color: #888;">
            © ${new Date().getFullYear()} Instagram Messenger. All rights reserved.
          </div>
        </div>
        `,
  };
  try {
    const sendMail = await transporter.sendMail(mailOptions);
    return sendMail;
  } catch (err) {
    return err;
  }
};

exports.generateToken = (email, id) => {
  const token = jwt.sign({ id, email }, process.env.JWT_KEY);
  return token;
};

const PostImageFolderName = "PostImage";
const PostVideoFolderName = "PostVideo";
const StoryFolderName="Story";
const PromptFolderName="Prompt";

exports.uploadOnCloud = async (file) => {
    
  const uniqueFileName = uuidv4();
  let folderName="";
  let dataURI;
  

  if(typeof(file)=="object" && file.type==="story")
  {
    folderName=StoryFolderName;
    const b64 = Buffer.from(file.media.buffer).toString("base64");
    dataURI = "data:" + file.media.mimetype + ";base64," + b64;
  }
  else if(typeof(file)=="object" && file.type==="prompt")
  {
    folderName=PromptFolderName;
    const b64 = Buffer.from(file.media.buffer).toString("base64");
    dataURI = "data:" + file.media.mimetype + ";base64," + b64;
  }
  else
  {
    const isImage = file.mimetype?.startsWith("image");
    folderName = isImage ? PostImageFolderName : PostVideoFolderName; 
    const b64 = Buffer.from(file.buffer).toString("base64");
    dataURI = "data:" + file.mimetype + ";base64," + b64;
  }

  const result = await cloudinary.v2.uploader.upload(dataURI, {
    folder: folderName,
    public_id: uniqueFileName,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    resource_type: "auto",
  });
  
  let fileSize;
  (file.type==="story" || file.type==="prompt")?fileSize=file.media.size:fileSize=file.size;
  return {
    url: result.url,
    resourceType: result.resource_type,
    fileSize: fileSize,
    duration: result.resource_type === "video" ? result.duration || 0 : 0,
    thumbnail: result.secure_url,
  };
};
