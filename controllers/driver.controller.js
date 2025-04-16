// import db from "../config/db.js";
import db from "../config/dbConnection.js";
import QRCode from "qrcode";
import { errorResponse, response } from "../utils/helper.js";
import { jwtDecode } from "jwt-decode";

export const getRideRequest = async (req, res) => {
  try {
    let sql;

    sql = `select * from trip_request`;

    let [rideRequest] = await db.execute(sql);

    if (rideRequest.length > 0) {
      return response(res, 200, { rideRequest: rideRequest }, "ok");
    } else {
      errorResponse(res, 200, "No data available");
    }
  } catch (error) {
    // console.log(`rideRequest : Error : ${error}`);
    return errorResponse(res, 500, "Internal server error : rideRequest");
  }
};

export const getrideDetails = async (req, res) => {
  const tripId = req.params.id;
  const query = `select u.first_name , u.last_name , tr.pickup_location , tr.drop_location , tr.distance , tr.fare_amount from trip_request as tr join uber_user as u on tr.user_id = u.id  where tr.id = ${tripId}`;
  try {
    const [result] = await db.execute(query);
    if (result.length > 0) {
      return response(
        res,
        200,
        { data: result },
        "Notification details send Successfully ! "
      );
    } else {
      return response(res, 200, { data: result }, "No Such Trip Found ! ");
    }
  } catch (err) {
    // console.log("Error in fetching ride details : " + err);
    return errorResponse(res, 400, " Error in fetching ride details : ! ");
  }
};

export const getNotificationCnt = async (req, res) => {
  try {
    const query = `select count(*) from notification where did = ${req.driver.id} and read_status = 'un_read' `;
    const [result] = await db.execute(query);
    
    if (result.length > 0) {
      return response(res, 200, { data: result }, "notification count send ! ");
    } else {
    }
  } catch (err) {
    console.log(err);
  }
};


export const updateNotificatonCnt = async (req, res) => {
  const notificationId = req.params.id;

  const query = `update notification set read_status = 'readed'  where id = ${notificationId}`;
  try {
    const [result] = await db.execute(query);

    if (result.changedRows > 0) {
      return response(
        res,
        200,
        { data: result },
        " Updated Notification details send Successfully ! "
      );
    } else {
      return response(res, 200, { data: result }, "No Such Notification Found  to be Updated ! ");
    }
  }
  catch (err) {
    console.log("error while updating the notification data !!");
    console.log(err);
    return errorResponse(res, 400, " Internal Server Error while updating the notification data !! ");

  }
}

export const getNotifiationDetails = async (req, res) => {

  const query = `select * from notification where did = ${req.driver.id} `;
  try {
    const [result] = await db.execute(query);

    if (result.length > 0) {

      result.forEach((e) => {
        e.formattedTime = formatTimeDifference(e.created_at);
      });
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return response(
        res,
        200,
        { data: result },
        "Notification details send Successfully ! "
      );
    } else {

      return response(res, 200, { data: "" }, " No Notification Found ! ");
    }
  } catch (err) {
    // console.log(`notification query Error ! ${err}`);
    errorResponse(res, 400, "notification query Error ! ");
    console.log(`notification query Error ! ${err}`);
    errorResponse(res, 400, "notification query Error ! ");
  }
};

export const getDriverPaymentPageData = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  try {
    const [responseData] = await db.execute(
      "select sum(trip.fare_amount) as current_balance,trip.DID from payment left join trip on payment.trip_id=trip.id group by trip.DID having trip.DID=?",
      [userId]
    );
    // console.log(responseData);

    response(res, 200, responseData, "");
  } catch (error) {
    // console.log(error);
  }
};

export const getDriverEarnings = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  // console.log(userId);

  try {
    const [LastWeek] = await db.execute(
      "SELECT sum(payment.fare_amount) as payment FROM payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and  payment.created_at >= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY AND payment.created_at < curdate() - INTERVAL DAYOFWEEK(curdate())-1 DAY group by trip.DID",
      ["1"]
    );
    // // console.log(LastWeek);
    const [thisWeek] = await db.execute(
      "select sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and week(payment.created_at) = week(now()) group by trip.DID",
      ["1"]
    );
    const [thisMonth] = await db.execute(
      "select sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and month(payment.created_at) = month(now()) group by trip.DID",
      ["1"]
    );
    const [lastMonth] = await db.execute(
      "SELECT sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and  YEAR(payment.created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(payment.created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH) group by trip.DID",
      ["1"]
    );

    // console.log("LastWeek");
    // console.log(LastWeek);
    response(
      res,
      200,
      {
        This_Month: thisMonth,
        This_Week: thisWeek,
        Last_Month: lastMonth,
        Last_Week: LastWeek,
      },
      ""
    );
  } catch (error) {
    // console.log(error);
  }
};

export const postDriverEarningsDates = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  // console.log("inside postDriverEarningsDates");
  // console.log(req.body);

  try {
    let groupBy = req.body.groupby;
    // let groupByClause = "";

    let orderByClause = "";

    let selectExtras = "";

    if (groupBy === "week") {
      selectExtras = `

  FLOOR(DATEDIFF(payment.created_at, ?) / 7) + 1 AS period_number,

  DATE_SUB(payment.created_at, INTERVAL WEEKDAY(payment.created_at) DAY) AS period_start,

  DATE_ADD(DATE_SUB(payment.created_at, INTERVAL WEEKDAY(payment.created_at) DAY), INTERVAL 6 DAY) AS period_end,
 DATE_FORMAT(payment.created_at, '%b') AS 
 label
 `;

      orderByClause = "ORDER BY period_number";
    } else if (groupBy === "month") {
      selectExtras = `

  PERIOD_DIFF(DATE_FORMAT(payment.created_at, '%Y%m'), DATE_FORMAT(?, '%Y%m')) + 1 AS period_number,

  DATE_FORMAT(payment.created_at, '%Y-%m-01') AS period_start,

  LAST_DAY(payment.created_at) AS period_end,
  DATE_FORMAT(payment.created_at, '%M') AS 
 label

 `;

      orderByClause = "ORDER BY period_number";
    } else if (groupBy === "year") {
      selectExtras = `

  YEAR(payment.created_at) - YEAR(?) + 1 AS period_number,

  DATE_FORMAT(payment.created_at, '%Y-01-01') AS period_start,

  DATE_FORMAT(payment.created_at, '%Y-12-31') AS period_end,
    DATE_FORMAT(payment.created_at, '%Y') AS 
 label

 `;

      orderByClause = "ORDER BY period_number";
    }

    let query = `

 SELECT 

 sum(payment.fare_amount) as fare_amount,trip.DID, ${selectExtras}

 FROM payment left join trip on payment.trip_id=trip.id

 WHERE  payment.created_at BETWEEN ? AND ?
 group by period_number,period_start,period_end,label,trip.DID
having trip.DID=?
 ${orderByClause};

`;
    // console.log("inside post");
    // having trip.DID=?
    //     else if (groupBy == "day") {
    // // console.log('INSIDE DAY');

    //       selectExtras = `

    //   FLOOR(DATEDIFF(payment.created_at, ?)) + 1 AS period_number,

    //  payment.created_at AS period_start,

    //   payment.created_at AS period_end,
    //  DATE_FORMAT(payment.created_at, '%b') AS
    //  label
    //  `;

    //       orderByClause = "ORDER BY period_number";
    //     }
    if (groupBy == "day") {
      // console.log("INSIDE DAY");
      query = `select DATE(created_at) as label , fare_amount as fare_amount from payment where created_at >= DATE('${req.body.start_date}') and created_at <=  DATE('${req.body.end_date}')  ORDER BY label`;
      try {
        const [rows] = await db.execute(query, [
          req.body.start_date,
          req.body.start_date,
          req.body.end_date,
          userId,
        ]);
        // console.log("rows");
        // console.log(rows);

        return response(
          res,
          200,
          {
            rows,
          },
          ""
        );
      } catch (error) {
        // console.log(error);
      }
    }
    const [rows] = await db.execute(query, [
      req.body.start_date,
      req.body.start_date,
      req.body.end_date,
      userId,
    ]);

    // console.log("rows");
    // console.log(rows);

    response(
      res,
      200,
      {
        rows,
      },
      ""
    );
  } catch (error) {
    // console.log(error);
  }
};

//  export const getDriverProfileData= async (req,res) => {
//   try {
//       const [[{document_url}]] = await db.execute('select document_url from documents where document_id =6 and DID=?',["2"])
//       // // console.log(document_url);
//       const [profileData] = await db.execute('select first_name,last_name,phone_number,email from uber_user left join driver on driver.user_id=uber_user.id where driver.id= ?',[2])
//       // console.log(profileData);

//       response(res, 200, {document_url,profileData},"");

//   } catch (error) {
//       // console.log(error);

//   }
// }
export const postDriverProfileData = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  try {
    if (req?.file) {
      // console.log("mmmmmmmmmmm");

      // console.log(req?.file);
      console.log(req?.file);
      const [document_url] = await db.execute(
        "update documents set document_url =?  where document_id =6 and DID=?",
        [req.file.url, userId]
      );
      // console.log(document_url);
    }

    // console.log(req.body);

    // // console.log(document_url);
    const [profileData] = await db.execute(
      "update uber_user set first_name=? , last_name=? , phone_number=? , email=? where id=(select user_id from driver where id =?)",
      [
        req.body.fname,
        req.body.lname,
        req.body.phone_number,
        req.body.email,
        userId,
      ]
    );
    // console.log(profileData);
    // // console.log(document_url);

    response(res, 200, {}, "update data successfuly");
  } catch (error) {
    // console.log(error);
  }

  // try {
  //   const [LastWeek] = await db.execute(
  //     "SELECT sum(payment.fare_amount) as payment FROM payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and  payment.created_at >= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY AND payment.created_at < curdate() - INTERVAL DAYOFWEEK(curdate())-1 DAY group by trip.DID",
  //     ["1"]
  //   );
  //   // // console.log(LastWeek);
  //   const [thisWeek] = await db.execute(
  //     "select sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and week(payment.created_at) = week(now()) group by trip.DID",
  //     ["1"]
  //   );
  //   const [thisMonth] = await db.execute(
  //     "select sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and month(payment.created_at) = month(now()) group by trip.DID",
  //     ["1"]
  //   );
  //   const [lastMonth] = await db.execute(
  //     "SELECT sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and  YEAR(payment.created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(payment.created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH) group by trip.DID",
  //     ["1"]
  //   );

  //   // console.log("LastWeek");
  //   // console.log(LastWeek);
  //   response(
  //     res,
  //     200,
  //     {
  //       This_Month: thisMonth,
  //       This_Week: thisWeek,
  //       Last_Month: lastMonth,
  //       Last_Week: LastWeek,
  //     },
  //     ""
  //   );
  // } catch (error) {
  //   // console.log(error);
  // }
};

export const getDriverProfileData = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  try {
    let [document_url] = await db.execute(
      "select document_url from documents where document_id =6 and DID=?",
      [userId]
    );
    document_url = document_url[0]?.document_url;
    // console.log(document_url);
    const [profileData] = await db.execute(
      "select first_name,last_name,phone_number,email from uber_user left join driver on driver.user_id=uber_user.id where driver.id= ?",
      [userId]
    );
    // console.log(userId);

    // console.log(profileData);

    response(res, 200, { document_url, profileData }, "");
  } catch (error) {
    // console.log(error);
  }
};

export const getAllRides = async (req, res) => {
  try {
    const d_id = req.params.dId;
    const r_type = req.params.r_type;

    let query = `select t.trip_request_id,DATE(t.pickup_time) as date,tr.drop_location,tr.pickup_location,tr.vehicle_preference,tr.distance,t.pickup_time,t.drop_time,t.Fare_amount,t.status from trip as t inner join trip_request as tr on t.trip_request_id=tr.id where t.DID=${d_id}`;
    let [dayIncome] = await db.query(
      `SELECT sum(fare_amount) as total FROM uber.trip where DID='${d_id}' and date(pickup_time)=CURDATE()  and status="completed";`
    );
    dayIncome = dayIncome[0].total;
    let [totalRides] = await db.query(
      `SELECT count(*) as total FROM uber.trip where DID='${d_id}' and date(pickup_time)=CURDATE()  and status="completed";`
    );
    totalRides = totalRides[0].total;
    if (r_type != "all") {
      query += ` and t.status='${r_type}'`;
    }
    const [rides] = await db.query(query);

    let [activeTime] = await db.execute(
      `SELECT sum(TIMESTAMPDIFF(SECOND, online_time,ifnull(offline_time,current_timestamp()))) as active_time FROM driver_log where driver_id=${d_id} and day(current_timestamp())=day(online_time);`
    );

    const data = {
      rides: rides,
      dailyIncome: dayIncome,
      dailyRides: totalRides,
      activeTime: activeTime,
    };
    response(res, 200, data, "All rides fetched Successfully");
  } catch (error) {
    errorResponse(res, 500, "Internal server error");
  }
};

function formatTimeDifference(createdAt) {
  const now = new Date();
  const createdDate = new Date(createdAt);

  const diff = now - createdDate;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diff < minute) return `${Math.round(diff / 1000)} seconds ago`;
  if (diff < hour) return `${Math.round(diff / minute)} minutes ago`;
  if (diff < day) return `${Math.round(diff / hour)} hours ago`;
  if (diff < month) return `${Math.round(diff / day)} days ago`;
  if (diff < year) return `${Math.round(diff / month)} months ago`;
  return `${Math.round(diff / year)} years ago`;
}

export const generateQR = async (req, res) => {
  try {
    const upi = {
      pa: "example@upi", // Merchant's UPI ID
      pn: "Ranjit Chavda", // Merchant's Name
      tn: "Payment for...", // Transaction Note
      am: req.params.amount, // Amount to be paid
      cu: "INR", // Currency
    };

    const upiLink = new URLSearchParams(upi).toString();
    const qrCodeImage = await QRCode.toDataURL(upiLink);
    response(res, 200, qrCodeImage, "QR Generated Successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Error generating QR code.");
  }
};

export const updateDriverStatus = async (req, res) => {
  try {
    const status = req.params.status == "online" ? 1 : 0;
    const d_id = req.params.d_id;
    const query = `update driver set is_online='${status}' where id=${d_id}`;

    const [result] = await db.query(query);

    if (status) {
      await db.execute(`insert into driver_log (driver_id) values (${d_id})`);
    } else {
      const [id] = await db.execute(
        `SELECT * FROM driver_log ORDER BY ${d_id} DESC LIMIT 1`
      );
      await db.execute(
        `update driver_log set offline_time=CURRENT_TIMESTAMP() where id=${id[0].id}`
      );
    }

    response(res, 200, result, "Status Updated Successfully");
  } catch (error) {
    // console.log(`driverStatus : Error : ${error.message}`);
    return errorResponse(res, 500, `${error.message}`);
  }
};

export const completeRide = async (req, res) => {
  try {
    const trip_id = req.params.ride_id;
    const mode = req.params.mode;
    const amount = req.params.amount;
    const queryRide = `update trip set status="completed" where id=${trip_id}`;
    const queryPayment = `insert into payment (trip_id,fare_amount,status,mode) VALUES ('${trip_id}','${amount}','success','${mode}')`;
    const resultRide = await db.execute(queryRide);
    const resultPayment = await db.execute(queryPayment);
    return response(res, 200, { resultRide, resultPayment }, "Ride Completed Successfully");
  } catch (error) {
    return errorResponse(res, 500, `${error.message}`);
  }
};

export const driverSidebarProfile = async(req,res) => {
  try {
    
    const driver_id = req.driver.id

    let query;

    query = `select * from driver where id=${driver_id}`

    const [driver] = await db.execute(query)

    const user_id = driver[0].user_id;

    query = `select first_name,last_name from uber_user where id=${user_id}`

    const [driver_details] = await db.execute(query)

    query = `select document_url from documents where document_id=6 and DID=${driver_id}`

    const [profile_url] = await db.execute(query)

    const sidebarProfile = {
      first_name : driver_details[0].first_name,
      last_name : driver_details[0].last_name,
      profile_url : profile_url[0].document_url,
      is_online : driver[0].is_online
    }

    return response(res,200,{ sidebarProfile},"profile data sent")
   
  } catch (error) {
    console.log(`driverSidebarProfile : Error : ${error.message}`)
  }
}

export const monthlySummary = async (req, res) => {
  try {
    const d_id = req.params.dId;

    let [monthIncome] = await db.query(
      `SELECT sum(fare_amount) as total FROM uber.trip where DID=${d_id} and month(pickup_time)=month(CURDATE())  and status="completed";`
    );
    monthIncome = monthIncome[0].total;

    let [monthRides] = await db.query(
      `SELECT count(*) as total FROM uber.trip where DID='${d_id}' and month(pickup_time)=month(CURDATE()) and status="completed";`
    );
    monthRides = monthRides[0].total;

    let [monthTime] = await db.execute(
      `SELECT sum(TIMESTAMPDIFF(SECOND, online_time,ifnull(offline_time,current_timestamp()))) as active_time FROM driver_log where driver_id=${d_id} and month(current_timestamp())=month(online_time);`
    );

    const data = {
      monthIncome: monthIncome,
      monthRides: monthRides,
      monthTime: monthTime,
    };

    response(res, 200, data, "All rides fetched Successfully");
  } catch (error) {
    errorResponse(res, 500, "Internal server error");
  }
};
