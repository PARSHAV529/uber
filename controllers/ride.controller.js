import db from "../config/dbConnection.js";
import { errorResponse, response } from "../utils/helper.js";


export const activerRideDetail = async (req, res) => {
  try {
    const d_id = req.params.driver_id;
    let driver_details = await db.query(`select * from driver where id='${d_id}'`);
    let query = `select * from trip where DID=${d_id} and status='active'`;

    const [activeRide] = await db.query(query);
    const [rideDetail] = await db.query(`select * from trip_request where id='${activeRide[0].trip_request_id}'`)
    const [user] = await db.query(`select concat(first_name, ' ', last_name) as name, phone_number from uber_user where id='${activeRide[0].user_id}'`)

    response(res, 200, {activeRide, rideDetail,user,driver_details}, "Ride details fetched successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};
