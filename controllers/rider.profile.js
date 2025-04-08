import { response } from "../utils/helper.js";
import db from "../config/dbConnection.js";

const getRiderProfile = async(req,res)=>{
    try{
        let sql = `SELECT * FROM uber_user WHERE id = 3`;

        const result = await db.query(sql);

        //console.log(result);

        response(res,201,result,'profile data fetched successfully')
    }
    catch(error){
        console.log(error);
        response(res,400,error,'could not fetch history');
    }
}

const updateRiderProfile = async(req,res)=>{
    try{
        console.log(req.body);
        
        let sql = `UPDATE uber_user set first_name = ?, last_name = ?, phone_number = ?, DOB = ? WHERE id = 3`;

        const result = await db.query(sql, [
            `${req.body.fname}`,
            `${req.body.lname}`,
            `${req.body.ph}`,
            `${req.body.dob}`
          ]);
        console.log(result);

        response(res,201,result,'profile data updated successfully')
    }
    catch(error){
        console.log(error);
        response(res,400,error,'could not update data');
    }
}
export {getRiderProfile,updateRiderProfile}