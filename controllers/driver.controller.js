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
    console.log(`rideRequest : Error : ${error}`);
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
    console.log("Error in fetching ride details : " + err);
    return errorResponse(res, 400, " Error in fetching ride details : ! ");
  }
};

export const getNotifiationDetails = async (req, res) => {
  const query = `select * from notification `;
  try {
    const [result] = await db.execute(query);

    if (result) {
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
      return errorResponse(
        res,
        400,
        " error while retriving the the notification details ! "
      );
    }
  } catch (err) {
    console.log(`notification query Error ! ${err}`);
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
    console.log(responseData);

    response(res, 200, responseData, "");
  } catch (error) {
    console.log(error);
  }
};

export const getDriverEarnings = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  console.log(userId);

  try {
    const [LastWeek] = await db.execute(
      "SELECT sum(payment.fare_amount) as payment FROM payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and  payment.created_at >= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY AND payment.created_at < curdate() - INTERVAL DAYOFWEEK(curdate())-1 DAY group by trip.DID",
      [userId]
    );
    // console.log(LastWeek);
    const [thisWeek] = await db.execute(
      "select sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and week(payment.created_at) = week(now()) group by trip.DID",
      [userId]
    );
    const [thisMonth] = await db.execute(
      "select sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and month(payment.created_at) = month(now()) group by trip.DID",
      [userId]
    );
    const [lastMonth] = await db.execute(
      "SELECT sum(payment.fare_amount) as payment from payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and  YEAR(payment.created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH) AND MONTH(payment.created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH) group by trip.DID",
      [userId]
    );

    console.log("LastWeek");
    let groupBy = "week";
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

    const query = `

 SELECT 

 sum(payment.fare_amount) as fare_amount,trip.DID, ${selectExtras}

 FROM payment left join trip on payment.trip_id=trip.id

 WHERE   payment.created_at BETWEEN ? AND ?
 group by period_number,period_start,period_end,label,trip.DID
 having trip.DID=?

 ${orderByClause};

`;

    const [rows] = await db.execute(query, [
      "2025-03-01 14:49:51",
      "2025-03-01 14:49:51",
      "2025-04-30 16:14:33",
      userId,
    ]);

    // const [rows] = await db.execute(

    //   `SELECT

    //     FLOOR(DATEDIFF(created_at, ?)/30)+1 AS week_number,

    //     DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY) AS week_start,

    //    DATE_ADD(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY), INTERVAL 30 DAY) AS week_end, payment.*
    //    FROM payment

    //    WHERE created_at BETWEEN ? AND ?

    //    ORDER BY week_start`,

    //   ["2025-03-01 14:49:51","2025-03-01 14:49:51", "2025-04-30 16:14:33"]

    //  );
    console.log("rows");
    console.log(rows);

    // console.log(LastWeek);
    response(
      res,
      200,
      {
        This_Month: thisMonth,
        This_Week: thisWeek,
        Last_Month: lastMonth,
        Last_Week: LastWeek,
        rows,
      },
      ""
    );
  } catch (error) {
    console.log(error);
  }
};

export const postDriverEarningsDates = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  console.log("inside postDriverEarningsDates");
  console.log(req.body);

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
    }  else if (groupBy === "month") {
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
    console.log("inside post");
    // having trip.DID=?
//     else if (groupBy == "day") {
// console.log('INSIDE DAY');

//       selectExtras = `

//   FLOOR(DATEDIFF(payment.created_at, ?)) + 1 AS period_number,

//  payment.created_at AS period_start,

//   payment.created_at AS period_end,
//  DATE_FORMAT(payment.created_at, '%b') AS 
//  label
//  `;

//       orderByClause = "ORDER BY period_number";
//     }
if(groupBy == "day"){
  console.log('INSIDE DAY');
  query= `select DATE(created_at) as label , fare_amount as fare_amount from payment where created_at >= DATE('${req.body.start_date}') and created_at <=  DATE('${req.body.end_date}')  ORDER BY label`
try {
  const [rows] = await db.execute(query, [
    req.body.start_date,
    req.body.start_date,
    req.body.end_date,
    userId,
  ]);
  console.log("rows");
  console.log(rows);


 return response(
    res,
    200,
    {
      rows,
    },
    ""
  );
} catch (error) {
  console.log(error

  );
  
}
  

  


}
    const [rows] = await db.execute(query, [
      req.body.start_date,
      req.body.start_date,
      req.body.end_date,
      userId,
    ]);

    
    console.log("rows");
    console.log(rows);


    response(
      res,
      200,
      {
        rows,
      },
      ""
    );
  } catch (error) {
    console.log(error);
  }
};

//  export const getDriverProfileData= async (req,res) => {
//   try {
//       const [[{document_url}]] = await db.execute('select document_url from documents where document_id =6 and DID=?',["2"])
//       // console.log(document_url);
//       const [profileData] = await db.execute('select first_name,last_name,phone_number,email from uber_user left join driver on driver.user_id=uber_user.id where driver.id= ?',[2])
//       console.log(profileData);

//       response(res, 200, {document_url,profileData},"");

//   } catch (error) {
//       console.log(error);

//   }
// }
export const postDriverProfileData = async (req, res) => {
  const decoded = jwtDecode(req.cookies.accessToken);
  const userId = decoded.id;
  try {
    if (req?.file) {
      console.log("mmmmmmmmmmm");

      console.log(req?.file);
      const [document_url] = await db.execute(
        "update documents set document_url =?  where document_id =6 and DID=?",
        [req.file.url, userId]
      );
      console.log(document_url);
    }

    console.log(req.body);

    // console.log(document_url);
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
    console.log(profileData);
    // console.log(document_url);

    response(res, 200, {}, "update data successfuly");
  } catch (error) {
    console.log(error);
  }

  // try {
  //   const [LastWeek] = await db.execute(
  //     "SELECT sum(payment.fare_amount) as payment FROM payment left join trip on payment.trip_id=trip.id WHERE trip.DID = ? and  payment.created_at >= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY AND payment.created_at < curdate() - INTERVAL DAYOFWEEK(curdate())-1 DAY group by trip.DID",
  //     ["1"]
  //   );
  //   // console.log(LastWeek);
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

  //   console.log("LastWeek");
  //   console.log(LastWeek);
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
  //   console.log(error);
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
    console.log(document_url);
    const [profileData] = await db.execute(
      "select first_name,last_name,phone_number,email from uber_user left join driver on driver.user_id=uber_user.id where driver.id= ?",
      [userId]
    );
    console.log(userId);

    console.log(profileData);

    response(res, 200, { document_url, profileData }, "");
  } catch (error) {
    console.log(error);
  }
};

export const getAllRides = async (req, res) => {
  try {
    const d_id = req.params.dId;
    const r_type = req.params.r_type;

    let query = `select t.trip_request_id,DATE(t.pickup_time) as date,tr.drop_location,tr.pickup_location,tr.vehicle_preference,tr.distance,t.pickup_time,t.drop_time,t.Fare_amount,t.status from trip as t inner join trip_request as tr on t.trip_request_id=tr.id where t.DID=${d_id}`;

    if (r_type != "all") {
      query += ` and t.status='${r_type}'`;
    }

    const [rides] = await db.query(query);
    response(res, 200, rides, "All rides fetched Successfully");
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
    const qrCodeData = "500 Rs";
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    res.render("driver/qrCodePage", { qrCodeImage });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating QR code");
  }
};

export const driverStatus = async (req, res) => {
  try {
  } catch (error) {
    console.log(`driverStatus : Error : ${error.message}`);
    return errorResponse(res, 500, `${error.message}`);
  }
};
