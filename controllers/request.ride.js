import db from "../config/dbConnection.js";
import { response } from "../utils/helper.js";

const requestRide = async (req, res) => {
  try {
    console.log(req.body);
    let sql = `INSERT INTO trip_request(user_id,pickup_location,drop_location,vehicle_preference,distance,Fare_amount,status) VALUES(?,?,?,?,?,?,?)`;

    const result = await db.query(sql, [
      1,
      `${req.body.source}`,
      `${req.body.destination}`,
      `${req.body.vehicleType}`,
      `${req.body.distance}`,
      `${req.body.fare_amount}`,
      "requested",
    ]);

    response(res, 201, result, "record inserted succesfully");

    console.log("reponse", response);
  } catch (error) {
    console.log("error", error);
    response(res, 400, error, "can not insert record");
  }
};

const getDirections = async(req,res)=>{
    console.log("you are fetchibng directions");
    try{
        let sql = `SELECT * FROM trip INNER JOIN trip_request ON trip_request.id=trip.trip_request_id INNER JOIN driver ON trip.DID=driver.id INNER JOIN uber_user ON uber_user.id = driver.user_id INNER JOIN  vehical ON vehical.DID=driver.id where trip.DID = 1 AND trip.status='accepted';`;

        let result = await db.query(sql);
        console.log(result[0]);

        response(res,201,result,'directions received successfully')
    }
    catch(error){
        console.log(error);
        response(res,400,error,'can not receive directions')
    }

}

const cancelRide = async(req,res)=>{

    console.log("here for canceloing ride");
    try{
        let sql = `UPDATE trip_request SET status='cancelled',updated_at=CURRENT_TIMESTAMP where user_id=1 AND (status='requested' OR status='accepted') `

        let result = await db.query(sql);
        console.log(result);

        response(res,201,result,'cancelled ride successfully')
    }
    catch(error){
        console.log(error)
        response(res,400,error,'can not cancel ride');
    }
}

const riderRideReview = async(req,res)=>{
  console.log(req.body);
  try{
    let sql = `UPDATE trip SET rating_count = ? WHERE trip.id = ${req.body.trip_id}`
    const result = await db.query(sql,[req.body.rateText])
    console.log(result);
    response(res,201,result,'review submitted successfully')
  }
  
  catch(error){
    console.log(error);
    response(res,400,error,'cannot submit the review')
    console.log();
  }
}

export { requestRide,getDirections,cancelRide,riderRideReview};
