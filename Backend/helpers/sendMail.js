// const nodemailer = require("nodemailer");
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_ID,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// exports.sendMail = async (email, otp) => {
//   console.log(email);

//   const mailOptions = {
//     from: process.env.EMAIL_ID,
//     to: email,
//     subject: "Instagram Messenger - Verify Your Email Address",
//     html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
//           <div style="background-color: #24292e; color: white; padding: 20px; text-align: center;">
//             <h2 style="margin: 0;">Instagram Messenger</h2>
//           </div>
//           <div style="padding: 30px; background-color: #ffffff; color: #333333;">
//             <h3>Verify Your Email Address</h3>
//             <p>Thank you for creating an account with <strong>Instagram Messenger</strong>.</p>
//             <p>To continue, please verify your email address using the code below:</p>
//             <div style="font-size: 28px; font-weight: bold; margin: 20px 0; text-align: center; color: #2c3e50;">
//               ${otp}
//             </div>
//             <p>This code is valid for <strong>5 minutes</strong>. If you did not request this, please ignore this email.</p>
//             <br />
//             <p style="font-size: 13px; color: #777777;">Instagram will never ask for your password, OTP, or credit card details via email.</p>
//           </div>
//           <div style="background-color: #f6f6f6; padding: 15px; font-size: 12px; text-align: center; color: #888;">
//             © ${new Date().getFullYear()} Instagram Messenger. All rights reserved.
//           </div>
//         </div>
//         `,
//   };
//   try {
//     const sendMail = await transporter.sendMail(mailOptions);
//     console.log(sendMail);
//     return sendMail;
//   } catch (err) {
//     return err;
//   }
// };
