import db from "../config/dbConnection.js";
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import { response, errorResponse } from "../utils/helper.js"
import { emailAuth, verifyOTP } from "./auth.controller.js";



const updateRiderPasswordOTP = async(req,res)=>{
    try{
        console.log(req.body);
        var newpwd = req.body.password;
        var confirm = req.body.confirm;

        if(newpwd != confirm){
            alert('passwords did not match. Retry')
        }
        else{
            try {
                const query = `SELECT email FROM uber_user WHERE id = 3`;
                const result = await db.execute(query);
        
                if (result.length != 0) {
                    const otp = crypto.randomInt(100000, 999999).toString();
        
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.EMAIL, // Your email
                            pass: process.env.PASSWORD, // Your app password
                        },
                    });
        
                    let mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: 'OTP Verification',
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
        
        
                    transporter.sendMail(mailOptions,async(error)=>{
                      if(error){
                        return errorResponse(res,400,`${error.message}`)
                      }else{
        
                        const encOTP = await bcrypt.hash(otp, 10);
                        
                        res.cookie("otp", encOTP, {
                            httpOnly: true,
                        });
                        res.cookie('userEmail',email, {
                            httpOnly: true
                        });
                        
                        return response(res, 200, { url: '/uber/api/otp-verification' }, "Get otp for email verification");
                      }
                    });
                } else {
                    return errorResponse(res, 409, "This Email is already in use. Try another Email!");
                }
            } catch (err) {
                console.error(`emailAuth - Error: ${err}`);
                return errorResponse(res, 500, "Internal Server Error");
            }
        }
        
    }
    catch(error){
        console.log(error);
        response(res,400,error,'could not update data');
    }
}

const updateRiderPassword = async(req,res)=>{
    // try{
    //     let sql = `SELECT * FROM uber_user WHERE id = 3`;

    //     const result = await db.query(sql);

    //     //console.log(result);

    //     response(res,201,result,'profile data fetched successfully')
    // }
    // catch(error){
    //     console.log(error);
    //     response(res,400,error,'could not fetch history');
    // }
}

export {updateRiderPasswordOTP, updateRiderPassword}