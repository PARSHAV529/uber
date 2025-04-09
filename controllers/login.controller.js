import nodemailer from "nodemailer";
import crypto from "crypto";
import db from "../config/dbConnection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { response, errorResponse } from "../utils/helper.js";
import { generateToken } from "../utils/generateToken.js";
import { getIo } from "../socket.js";

export const loginUser = async (req, res) => {
  try {
    console.log(req.body);
    
    const { email, password } = req.body;

    const [hashedPassword] = await db.query(
      `select password from uber_user where email='${email}'`
    );
console.log(hashedPassword);

    const pwd = await bcrypt.compare(password, hashedPassword[0].password);

    console.log(pwd)
    if (pwd) {
      const query = `select * from uber_user where email='${email}' and password='${hashedPassword[0].password}'`;
      const [data] = await db.query(query);

      console.log(data)
      const [d_id] = await db.query(
        `select id from driver where user_id='${data[0].id}'`
      );
      console.log(d_id[0].id);
      data[0].id = d_id[0].id 
      if (data[0]) {

        let token = generateToken(data[0],req.cookies.user_role)
        res.cookie("accessToken", token, {
          httpOnly: false,
        });
        // const io = getIo();
        // // io.on("connection", (socket) => {
        // //   console.log("soket connected");
        //   // console.log(socket.id);
        //   // io.on("disconnect", () => {
        //   //   console.log("user disconnected");
        //   // });
        //   let count=0;
        //   io.on('update-driver-location', async(data) => {
        //     console.log(data)
        //     console.log(count++);
        //       // const decoded = jwtDecode(req.cookies.accessToken);
        //       // const userId = decoded.id;
        //     await db.execute('update driver set live_location=? where id =?',[JSON.stringify(data),"9"]);
        //     io.emit('driver-location', data)
        //   }
        //   );
        // }
        // );
        console.log("token",token)
        return response(res, 200, data[0], "User Login Successfully");
        const accessToken = jwt.sign(
          {
            id: d_id[0].id > 0 ? d_id[0].id : data[0].id,
            fname: data[0].first_name,
            lname: data[0].last_name,
            phNo: data[0].phone_no,
            email: email,
          },
          process.env.JWT_SECRET_KEY
        );
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
        });
        response(res, 200, data[0], "User Login Successfully");
      } else {
        return errorResponse(res, 400, "Email id & Password not matched");
      }
    }else{
      return errorResponse(res,400,"Email id & Password not matched")
    }
  } catch (err) {
    console.log(err);
    
    return errorResponse(res, 500, "Internal server error");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const userEmail = req.body.email;
    // const userEmail = "mop321062@gmail.com";
    const otp = crypto.randomInt(100000, 999999).toString();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: "Password Reset Verification Code",
      html: `
            <div style="font-family: 'Segoe UI'; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8a/37/a4/8a37a49f-e839-4cd8-8d97-e198116c2df7/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/230x0w.webp" alt="Uber Logo" style="max-width: 120px; height: auto;" />
                </div>
                <h1 style="color: #276EF1; text-align: center; font-size: 28px; margin-bottom: 20px;">Verify Your OTP</h1>
                <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #333333; margin-bottom: 25px;">
                    Thank you for reaching out to Uber! To reset your password and regain access to your account, please use the verification code below.
                </p>
                <div style="background-color: #F7F8FA; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="font-size: 16px; color: #555555; margin-bottom: 10px;">Your OTP for Password Change is</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #276EF1; margin: 0;">
                        ${otp}
                    </p>
                </div>
                <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #333333; margin-bottom: 25px;">
                    If you did not request a password reset, please ignore this message.
                </p>
                <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #333333;">
                   Best regards, The Uber Team
                </p>

                </div>
            </div>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log("Error occurred: " + error.message);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    response(res, 200, { otp, userEmail }, "Mail Sent Successfully");
  } catch (err) {
    errorResponse(res, 500, "Internal server error");
  }
};

export const updatePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `update uber_user set password='${hashedPassword}' where email='${email}'`;

    await db.query(query);

    response(res, 200, "", "Password updated");
  } catch (error) {
    errorResponse(res, 500, "Internal server error");
  }
};
