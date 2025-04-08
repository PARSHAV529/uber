import { response } from "../utils/helper.js";
import db from "../config/dbConnection.js";

export const getRiderHistory = async(req,res)=>{
    try{
        let sql = `SELECT * FROM trip_request WHERE user_id = 1 ORDER BY created_at DESC`;

        const result = await db.query(sql);

        console.log(result);

        response(res,201,result,'history fetched successfully')
    }
    catch(error){
        console.log(error);
        response(res,400,error,'could not fetch history');
    }
}

export const getHistory = async(req,res)=>{
    try{
        let sql = `SELECT * FROM trip_request WHERE user_id = 1 ORDER BY created_at DESC LIMIT 3`;

        const result = await db.query(sql);

        console.log(result);

        response(res,201,result[0],'history fetched successfully')
    }
    catch(error){
        console.log(error);
        response(res,400,error,'could not fetch history');
    }
}