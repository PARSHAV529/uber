import crypto from "crypto";
import db from "../config/dbConnection.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { response, errorResponse } from "../utils/helper.js";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

import { commonToken, generateToken } from "../utils/generateToken.js";

export const emailAuth = async (req, res) => {
  try {

    const email = req.body.email;
    // console.log(email);

    let query = `SELECT * FROM uber_user  WHERE email = ?`;
    const [result] = await db.execute(query, [email]);

    if (result.length === 0) {

      const otp = crypto.randomInt(100000, 999999).toString();
      console.log('ooooooooooooooooooooooooooooooooooooooooooooooooo');
      console.log(otp);
      console.log('ooooooooooooooooooooooooooooooooooooooooooooooooo');
      
      
      let hashedOtp = await bcrypt.hash(otp, 10);

      let token = commonToken({ email: email, otp: hashedOtp, user_role: req.cookies.user_role })

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL, // Your email
          pass: process.env.PASSWORD, // Your app password
        },
      });

      let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "OTP Verification",
        html: `
                    <div style="font-family: 'Segoe UI'; max-width: 600px; margin: auto; background-color: black; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlJIOGtHi6yLhWs9gI0Bz1T83KoUzuqCQ7IQ&s" alt="Uber Logo" style="max-width: 120px; height: auto; border-radius :10px;"/>
                        </div>
                        <h1 style="color: #276EF1; text-align: center; font-size: 28px; margin-bottom: 20px;">Verify Your Email</h1>
                        <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #333333; margin-bottom: 25px;">
                            Thank you for joining Uber! To complete your registration and access all features, please use the verification code below.
                        </p>
                        <div style="background-color: #F7F8FA; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                            <p style="font-size: 16px; color: #555555; margin-bottom: 10px;">Your verification code is:</p>
                            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #276EF1; margin: 0;">
                                ${otp}
                            </p>
                        </div>
                        <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #333333;">
                            Thank You For Choosing Uber.
                        </p>
                    </div>
                `,
      };

      transporter.sendMail(mailOptions, async (error) => {
        if (error) {
          // console.log(error);
          return errorResponse(res, 400, `${error.message}`);
        } else {

          res.cookie("emailToken", token)

          return response(
            res,
            200,
            { url: "/uber/api/otp-verification" },
            "Get otp for email verification"
          );
        }
      });
    } else {
      return errorResponse(
        res,
        409,
        "This Email is already in use. Try another Email!"
      );
    }
  } catch (err) {
    console.error(`emailAuth - Error: ${err}`);
    return errorResponse(res, 500, "Internal Server Error");
  }
};

export const verifyOTP = async (req, res) => {
  const otp = req.body.otp;
  try {
    if (!req.cookies.emailToken) {
      return errorResponse(res, 400, "please signup first...")
    } else {

      jwt.verify(req.cookies.emailToken, process.env.EMAIL_AUTH_SECRETKEY, async (error, decoded) => {
        if (error) {
          res.clearCookie("emailToken")
          return response(res, 401, { url: "/uber/signup" }, `Access denied !:${error.message}`)
        } else {
          const flag = await bcrypt.compare(otp, decoded.otp)
          if (flag) {

            let createProfileTokenData = {
              email: decoded.email,
              user_role: decoded.user_role
            }

            let token = commonToken(createProfileTokenData)
            res.clearCookie("emailToken")
            res.cookie("createProfileToken", token);
            return response(res, 200, { url: "/uber/create-profile" }, "OTP veryfied successfully...")
          } else {
            return errorResponse(res, 400, "wrong OTP !!!")
          }
        }
      })
    }
  } catch (err) {
    // console.log(err)
    return errorResponse(
      res,
      500,
      "Something went wrong, try signing up again...<a href='/uber/signup'>signup</a>"
    );
  }
};

export const insertSignUpDetails = async (req, res) => {
  let url;
  let tokenData;

  try {
    const fname = req.body.fname;
    const lname = req.body.lname;
    const pass = req.body.password;
    const phNo = req.body.phone;

    const email = req.person.email;
    const user_role = req.person.user_role;
    // console.log(user_role)
    // console.log(email)

    const encPassword = await bcrypt.hash(pass, 10);
    const query = `Insert into  uber_user (first_name , last_name , phone_number , email , password,user_role ) values('${fname}' , '${lname}' ,'${phNo}' ,'${email}' , '${encPassword}','${user_role}')`;
    const [result] = await db.execute(query);

    // console.log(result)

    if (user_role === "driver") {

      const sql = `insert into driver (user_id) values (${result.insertId})`

      const [driver] = await db.execute(sql)
      tokenData = {
        id: driver.insertId,
        email: email,
        user_role: user_role
      }
      url = "/uber/driver/upload-documents"
    } else {
      url = "/"
      tokenData = {
        id: result.insertId,
        email: email,
        user_role: user_role
      }
    }

    let token = generateToken(tokenData, user_role)
    res.cookie("accessToken", token);

    res.clearCookie("createProfileToken")
    return response(res, 201, { url: url }, "profile created successfully...")

  } catch (err) {
    // console.log(`signup - Error : ${err}`);
    return errorResponse(res, 500, `Internal server error : ${error.message}`)
  }
};

export const getDriverSignupDocumentPageData = async (req, res) => {
  const [responseData] = await db.execute("select * from document_list");
  // console.log(req.cookies.accessToken);

  const decoded = jwtDecode(req.cookies.accessToken);
  // console.log(decoded);

  const [userStatus] = await db.execute(
    "select document_id,Remark,is_approved,document_url,document_list.document_name,document_list.id from documents left join document_list on documents.document_id=document_list.id where DID = ?",
    [decoded.id]
  );
  // // console.log(userStatus);
  //   // console.log(response);
  for (let i = 0; i < responseData.length; i++) {
    for (let j = 0; j < userStatus.length; j++) {
      if (responseData[i].id === userStatus[j].document_id) {
        responseData[i].Remark = userStatus[j].Remark;
        responseData[i].is_approved = userStatus[j].is_approved;
        responseData[i].document_url = userStatus[j].document_url;
        responseData[i].document_name = userStatus[j].document_name;
        responseData[i].id = userStatus[j].id;
      }
    }
  }
  response(res, 200, responseData);
};

export const getDriverSignupvehicleData = async (req, res) => {
  // console.log(req.cookies.accessToken);

  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  try {
    const [vehicle_approved] = await db.execute(
      "select vehicle_approved from driver where id = ?",
      [userId]
    );
    const [responseData] = await db.execute(
      "select * from vehicle where DID = ?",
      [userId]
    );
    for (let i = 0; i < responseData.length; i++) {
      responseData[i].vehicle_approved = vehicle_approved[0].vehicle_approved;
    }

    response(res, 200, responseData);
  } catch (error) {
    errorResponse(res, 500, "Error fetching data");
  }
};

export const postDriverSignupvehicleData = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  try {
    // console.log("files from con");
    // console.log(req.files);
    const { RC_BOOK, PUC, Insurance } = req.files;

    const { type, colour, Number_plate, PUC_Exp_date, insurance_Exp_date } =
      req.body;
    const [responseData] = await db.execute(
      "INSERT INTO `vehicle`( `DID`, `capacity`, `type`, `colour`, `rc_book`, `insurance`, `puc`, `number_plate`, `puc_exp_date`, `insurance_exp_date`) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        userId,
        2,
        type,
        colour,
        RC_BOOK[0].url,
        PUC[0].url,
        Insurance[0].url,
        Number_plate,
        PUC_Exp_date,
        insurance_Exp_date,
      ]
    );
    // // console.log(response);
    const [status_update] = await db.execute(
      "update driver set vehicle_approved=? where id = ?",
      ["pending", userId]
    );

    if (responseData.affectedRows === 1) {
      if (status_update.affectedRows === 1) {
        response(res, 200, {}, "Document uploaded successfully");
      } else {
        errorResponse(res, 500, "Error updating status");
      }
    }
  } catch (error) {
    console.log(error);

    errorResponse(res, 500, "Error fetching data");
  }
};

export const postDriverSignupDocument = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  // console.log(req.file);
  if (req.file.url) {
    const query = `insert into documents (DID,document_id,document_url) values(${userId},${req.body.document_id},'${req.file.url}')`

    // console.log(query)
    const [responseData] = await db.execute(
      "insert into documents (DID,document_id,document_url) values(?,?,?)",
      [userId, req.body.document_id, req.file.url]
    );
    // console.log(responseData);

    if (responseData.affectedRows === 1) {
      response(res, 200, {}, "Document uploaded successfully");
    }
  }
};

export const userLogout = async(req,res) => {
  try {
    res.clearCookie("accessToken")
    return response(res,200,{url : "/uber/driver"},"Logged out successfull...")
  } catch (error) {
    // console.log(`userLogout : Error : ${error.message}`)
    return errorResponse(res,500,`Internal server error : ${error.message}`)
  }
}
