import db from "../config/dbConnection.js";
import { errorResponse, response } from "../utils/helper.js";

const generateTripOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const fetchDriverWithinRadius = async (req, res) => {
  try {
    // console.log(req.body);

    let userSourceLatitude = req.body.userSourceLatitude;
    let userSourceLongitude = req.body.userSourceLongitude;
    let vehicleType = req.body.vehicleType;

    let query = `SELECT 

    d.id AS driver_id,

    d.user_id,

    u.first_name AS first_name,  

    d.live_location,

    d.is_online,
    
    (JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lng'))) AS longitude,
    
    (JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lat'))) AS latitude,

    v.type AS type,  
    
    v.number_plate,

    (6371 * acos(cos(radians(${userSourceLatitude})) * cos(radians(JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lat')))) * cos(radians(JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lng'))) - radians(${userSourceLongitude})) + sin(radians(${userSourceLatitude})) * sin(radians(JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lat')))))) AS distance

FROM 

    driver d

JOIN 

    uber_user u ON d.user_id = u.id  

JOIN 

    vehicle v ON d.current_vehicle = v.id  

WHERE 

    d.is_online = 1  
    AND v.type = '${vehicleType}'

HAVING 

    distance <= 5

ORDER BY 

    distance`;

    let [drivers] = await db.execute(query);

    // console.log("drivers :", drivers);

    if (drivers.length === 0) {
      return response(res, 200, {}, "No drivers available");
    } else {
      return response(
        res,
        200,
        { drivers: drivers },
        "drivers successfully fetched.."
      );
    }
  } catch (error) {
    // console.log(`fetchDriverWithinRadius : Error : ${error.message}`);
    return errorResponse(res, 500, "Internal server error !");
  }
};

let userSocketId = [];
export function handleSocketConnection(io) {
  io.on("connection", function (socket) {
    // // console.log("A user connected");

    socket.on("register", (Id) => {
      // console.log(Id);

      // console.log("in the reg");
      const id = Id.split("_")[0];
      const role = Id.split("_")[1];

      socket.join(id);
      // console.log("id in register", Id);
      if (role == "rider") {
        //   // console.log('user id',Id);
        userSocketId.push({ id: id, drivers: [], data: {} });
      }
      // console.log("register", userSocketId);
    });
    // let id = 2
    // io.to(id.toString).emit("ride-request", { message: "Ride Reuqest from rider" });

    socket.on("rider-request-drivers", async (data) => {
      // console.log("inside the ", data);

      try {
        let query = `SELECT 
              d.id AS driver_id,
              d.user_id,
              u.first_name AS first_name,  
              d.live_location,
              d.is_online,
           
              (JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lng'))) AS longitude,
              (JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lat'))) AS latitude,
              v.type AS type,  
              v.number_plate,
              (6371 * acos(cos(radians(${data.userSourceLatitude})) * cos(radians(JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lat')))) * cos(radians(JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lng'))) - radians(${data.userSourceLongitude})) + sin(radians(${data.userSourceLatitude})) * sin(radians(JSON_UNQUOTE(JSON_EXTRACT(d.live_location, '$.lat')))))) AS distance
          FROM 
              driver d
          JOIN 
              uber_user u ON d.user_id = u.id  
          JOIN 
              vehicle v ON d.current_vehicle = v.id  
          WHERE 
              d.is_online = 1  
              AND v.type = '${data.vehicleType}'
          HAVING 
              distance <= 5
          ORDER BY 
              distance`;

        let [drivers] = await db.execute(query);
        // console.log("drivers", drivers);
        let tripRequestId = data.trip_request_id;
        // // console.log("tripRequestId:",tripRequestId);
        let sql = `SELECT * FROM trip_request WHERE id = '${tripRequestId}'`;
        const [result] = await db.query(sql);

        const rider = userSocketId.find((r) => r.id == data.riderId);
        console.log("rider is hereeeeeeeeeeeeeeee", rider);

        if (rider) {
          rider.drivers = drivers;
          rider.result = result;
          rider.data = data;
          rider.tripRequestId = tripRequestId;

          const firstDriver = rider.drivers[0];
          console.log("FD: ",firstDriver)
          if (firstDriver) {
            io.to(firstDriver.driver_id.toString()).emit("ride-request", {
              data: rider.data,
              result: rider.result,
              message: "Ride Reuqest from rider",
              riderId: rider.id,
              tripRequestId: rider.tripRequestId,
            });
          } else {
            // console.log("No drivers Founded");
          }
        } else {
          // console.log("rider is not found");
        }
      } catch (error) {
        // console.log(`fetchDriverWithinRadius2 : Error : ${error.message}`);
      }
    });
    socket.on(
      "ride_response",
      async (driverId, riderId, accepted, trip_request_id, fare_amount) => {
        console.log("in the response", driverId);
        console.log("in the response", riderId);
        const rider = userSocketId.find((r) => r.id == riderId);
        console.log(rider);
        const otp = generateTripOTP();

        if (accepted) {
          const driver = rider.drivers.find((d) => d.driver_id == driverId);
          await db.execute(
            "INSERT INTO `trip`( `trip_request_id`, `user_id`, `DID`,`status`,`fare_amount`,`otp`) VALUES (?,?,?,?,?,?)",
            [trip_request_id, riderId, driverId, "active", fare_amount, otp]
          );
          io.to(driverId.toString()).emit("ride_status", {
            status: "accepted",
            rider,
          });
          io.to(rider.id).emit("ride_status", { status: "accepted", driver });
          // io.to(driver.socketId).emit("live-location-request", {
          //   message: "Ride Request from rider for live location",
          //   driverId: driver.id,
          // });
        } else {
          rider.drivers.shift();
          const nextDriver = rider.drivers[0];
          if (nextDriver) {
            io.to(nextDriver.driver_id.toString()).emit("ride-request", {
              data: rider.data,
              result: rider.result,
              message: "Ride Reuqest from rider",
              riderId: rider.id,
              tripRequestId: rider.tripRequestId,
            });
          } else {
            io.emit("ride_status", { status: "no more driver available" });
          }
        }
      }
    );

    socket.on("disconnect", function () {
      console.log("A user disconnected");
    });
  });
}

// import { response } from "../utils/helper.js";
// import mapsdk from 'mapmyindia-sdk-nodejs';

const requestRide = async (req, res) => {
  try {
    // console.log(req.body);
    let sql = `INSERT INTO trip_request(user_id,pickup_location,drop_location,vehicle_preference,distance,fare_amount,status) VALUES(?,?,?,?,?,?,?)`;

    const result = await db.query(sql, [
      res.locals.user_id,
      `${req.body.source}`,
      `${req.body.destination}`,
      `${req.body.vehicleType}`,
      `${req.body.distance}`,
      `${req.body.fare_amount}`,
      "requested",
    ]);

    response(res, 201, result, "record inserted succesfully");
  } catch (error) {
    // console.log("error", error);
    response(res, 400, error, "can not insert record");
  }
};

const getRequestDirection = async (req, res) => {
  let tripRequestId = req.cookies["trip_request_id"];

  try {
    let sql = `SELECT pickup_location,drop_location,fare_amount FROM trip_request WHERE id = '${tripRequestId}' AND user_id=${res.locals.user_id} AND status='requested'`;

    const result = await db.query(sql);

    response(res, 201, result, "directions recieved");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "cannot get directions");
  }
};

const getDirections = async (req, res) => {
  // console.log("you are fetchibng directions");
  try {
    let sql = `SELECT * FROM trip INNER JOIN trip_request ON trip_request.id=trip.trip_request_id INNER JOIN driver ON trip.DID=driver.id INNER JOIN uber_user ON uber_user.id = driver.user_id INNER JOIN  vehicle ON vehicle.DID=driver.id where trip.DID = ? AND trip.status='active';`;

    let result = await db.query(sql, [req.query.id]);
    console.log(result[0]);

    //  mapsdk.geoCodeGivenAddressString('43c2fc7cb353b21531b0f2d76c25a0af','esparkbiz').then(function(res)
    //  {
    //      // console.log(JSON.stringify(res));
    //  }).catch(function(ex){
    //      // console.log('came in catch');
    //      // console.log(ex);
    //  });
    response(res, 201, result, "directions received successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "can not receive directions");
  }
};

const cancelRide = async (req, res) => {
  // console.log("here for canceloing ride");
  try {
    let sql = `UPDATE trip_request SET status='cancelled',updated_at=CURRENT_TIMESTAMP where user_id=${res.locals.user_id} AND (status='requested' OR status='accepted') `;

    let result = await db.query(sql);
    // console.log(result);

    response(res, 201, result, "cancelled ride successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "can not cancel ride");
  }
};

const riderRideReview = async (req, res) => {
  // console.log(req.body);
  try {
    let sql = `UPDATE trip SET rating_count = ? WHERE trip.id = ${req.body.trip_id} AND user_id=${res.locals.user_id}`;
    const result = await db.query(sql, [req.body.rateText]);
    // console.log(result);
    response(res, 201, result, "review submitted successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "cannot submit the review");
    // console.log();
  }
};

const getRiderHistory = async (req, res) => {
  try {
    let sql = `SELECT * FROM trip_request WHERE user_id = ${res.locals.user_id} ORDER BY created_at DESC`;

    const result = await db.query(sql);

    // // console.log(result);

    response(res, 201, result, "history fetched successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "could not fetch history");
  }
};

const getHistory = async (req, res) => {
  // console.log("user Id in history page", res.locals);
  try {
    let sql = `SELECT * FROM trip_request WHERE user_id = ${res.locals.user_id} ORDER BY created_at DESC LIMIT 3`;

    const result = await db.query(sql);

    // console.log(result);

    response(res, 201, result[0], "history fetched successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "could not fetch history");
  }
};

const getRiderProfile = async (req, res) => {
  console.log("hello");
  try {
    let sql = `SELECT * FROM uber_user WHERE id = ${res.locals.user_id}`;

    const result = await db.query(sql);

    //// console.log(result);

    response(res, 201, result, "profile data fetched successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "could not fetch history");
  }
};

const updateRiderProfile = async (req, res) => {
  try {
    let sql = `UPDATE uber_user set first_name = ?, last_name = ?, phone_number = ?, DOB = ? WHERE id = ${res.locals.user_id}`;

    const result = await db.query(sql, [
      `${req.body.fname}`,
      `${req.body.lname}`,
      `${req.body.ph}`,
      `${req.body.dob}`,
    ]);
    // console.log(result);

    response(res, 201, result, "profile data updated successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "could not update data");
  }
};

const updateRiderProfilePicture = async (req, res) => {
  try {
    let sql = `UPDATE uber_user set profile_photo = ? WHERE id = ${res.locals.user_id}`;

    const result = await db.query(sql, [`${req.body.url}`]);
    // console.log(result);

    response(res, 201, result, "profile data updated successfully");
  } catch (error) {
    // console.log(error);
    response(res, 400, error, "could not update data");
  }
};

const riderLogout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    return response(res, 200, { url: "/" }, "Logged out successfully");
  } catch (error) {
    // console.log(`riderLogout : Error : ${error.message}`);
    return errorResponse(res, 500, `Internal server error : ${error.message}`);
  }
};

export {
  requestRide,
  getDirections,
  cancelRide,
  riderRideReview,
  getRequestDirection,
  getHistory,
  getRiderHistory,
  getRiderProfile,
  updateRiderProfile,
  updateRiderProfilePicture,
  riderLogout,
};
