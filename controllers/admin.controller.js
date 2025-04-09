import db from "../config/dbConnection.js";
import { hashSync, compareSync } from "bcrypt";
import { response, errorResponse } from "../utils/helper.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const protectedController = async (req, res) => {
  res.status(200).json({ message: "success" });
};

export const postAdminLogin = async (req, res) => {
  console.log("inside postAdminLogin");
  let email = req.body.email;
  let password = req.body.password;

  let userPayload = {
    email: email,
  };

  try {
    const [login_credential] = await db.query(
      "select * from admin where username = ?",
      [req.body.email]
    );
    // console.log(login_credential);

    if (login_credential.length > 0) {
      let hash = login_credential[0].password;

      const login_flag = bcrypt.compareSync(password, hash);
      // console.log(process.env.SECRETKEY);
      if (login_flag) {
        let token = jwt.sign(userPayload, process.env.SECRETKEY, {
          expiresIn: "10h",
        });
        // console.log(token);

        res.cookie("adminLoginToken", token, {
          httpOnly: false,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
        });

        return response(res, 200, token, "Token set successfully");
      } else {
        return errorResponse(res, 500, "Error Logging in user");
      }
    } else {
      return errorResponse(res, 500, "no user found");
    }
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

//DASHBOARD APIS

export const activeDrivers = async (req, res) => {
  // api to get data of active drivers, todays rides,todays revenue

  try {
    const [activeDriverList] = await db.query(
      `select  count(*) as activeDrivers from driver where is_online = 1 `
    );
    const [todaysRides] = await db.query(`
      select count(*) as todaysRides from trip where drop_time >=  CURDATE();
      `);
    const [todaysRevenue] = await db.query(`
      select sum(admin_cut) as todaysRevenue from admin_revenue  where created_at >=  CURDATE();
      `);
    const [toatalUsers] = await db.query(`
    select count(*) as toatalUsers from uber_user where is_deleted = 0`);

    return response(
      res,
      200,
      {
        activeDriverList: activeDriverList,
        todaysRides: todaysRides,
        todaysRevenue: todaysRevenue,
        toatalUsers: toatalUsers,
      },
      "Driver list fetched successfully "
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getChartData = async (req, res) => {
  try {
    const [revenueLastWeek] = await db.query(`
      SELECT DATE(created_at) AS date, SUM(admin_cut) AS revenue FROM admin_revenue WHERE YEARWEEK(created_at, 1) < YEARWEEK(CURDATE(), 1) GROUP BY DATE(created_at) ORDER BY date`);
    // const [revenuePerDay] = await db.query(`
    //   SELECT DATE(created_at) AS date, SUM(admin_cut) AS revenue FROM admin_revenue WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) GROUP BY DATE(created_at) ORDER BY date`);
    // console.log(revenuePerDay);
    const [lastMonthRevenue] = await db.query(
      `SELECT DATE(created_at) AS date, sum(admin_cut)as revenue FROM admin_revenue WHERE YEAR(created_at) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH) AND MONTH(created_at) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) GROUP BY DATE(created_at) ORDER BY date `
    );
    // console.log(lastMonthRevenue);

    return response(
      res,
      200,
      {
        revenueLastWeek,
        lastMonthRevenue,
      },
      "Chart data fetched succesfully !"
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const customRevenue = async (req, res) => {
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;

  let d1 = new Date(start_date);
  let d2 = new Date(end_date);

  if (d2 > d1) {
    try {
      const [customRevenue] = await db.query(
        `select DATE(created_at) as date , SUM(admin_cut) as revenue from admin_revenue where created_at > DATE('${start_date}') and created_at <  DATE('${end_date}') GROUP BY DATE(created_at) ORDER BY date`
      );

      return response(
        res,
        200,
        {
          customRevenue: customRevenue,
        },
        "Custom revenue fetched successfully"
      );
    } catch (err) {
      return errorResponse(res, 500, err.message);
    }
  } else {
    return errorResponse(res, 500, "Enter valid range");
  }
};

export const driverRequest = async (req, res) => {
  console.log("inside driverRequest");

  try {
    const [driverRequests] = await db.query(`
        select d.id as driver_id, u.first_name,u.last_name, u.email, d.document_status, d.created_at from uber_user as u join driver as d on u.id = d.user_id where d.document_status != 'approved' or d.vehicle_approved != 'approved'
          `);
    return response(
      res,
      200,
      {
        driverRequests: driverRequests,
      },
      "driver list fetched successfully "
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};

export const driverRejectedRequest = async (req, res) => {
  console.log("inside driverRequest");

  try {
    const [driverRejectedRequests] = await db.query(`
        select d.id as driver_id, u.first_name,u.last_name, d.document_status, u.created_at from uber_user as u join driver as d on u.id = d.user_id where d.document_status = 'rejected'
          `);

    return response(
      res,
      200,
      {
        driverRejectedRequests: driverRejectedRequests,
      },
      "Rejected Driver list fetched successfully "
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};

export const getOneDriverRequest = async (req, res) => {
  console.log("inside getOneDriverRequest");
  let driver_id = req.body.driver_id;
  try {
    const [driver_details] = await db.query(
      `select d.id as driver_id,d.*, u.* from driver as d join uber_user as u on u.id = d.user_id where d.id = ${driver_id}`
    );

    const [documentList] = await db.query(
      ` select docs.id as doc_id, docs.*, dlist.* from documents as docs join document_list as dlist on docs.document_id = dlist.id where docs.DID = ${driver_id} and dlist.id != 6`
    );

    const [vehicalDetails] = await db.query(
      `select * from vehicle where DID = ${driver_id}`
    );

    // console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
    // console.log(documentList);

    return response(
      res,
      200,
      {
        driver_details: driver_details,
        documentList: documentList,
        vehicalDetails: vehicalDetails,
      },
      "data of driver request fetched successfully"
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};

export const submitRejectDocument = async (req, res) => {
  console.log("inside submitRejectDocument");
  // console.log(req.body);
  let documentName = req.body.documentName;
  try {
    const [docDbResponse] = await db.query(`
      update documents set is_approved = 'rejected', remark = '${req.body.remark}', updated_at = current_timestamp where DID = ${req.body.driver_id} and id = ${req.body.id}
      `);

    const [notificationDbResponse] = await db.query(`
        insert into notification (DID,message_subject,message_text,created_at) values (${req.body.driver_id}, '${documentName} rejected', 'your ${documentName} has been rejected by our administration, for further details please check the mail from our end !', current_timestamp);
        `);

    return response(
      res,
      200,
      {
        docDbResponse: docDbResponse,
        span_text: "rejected",
      },
      "Document Rejected successfully"
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};

export const approveDocument = async (req, res) => {
  console.log("inside approveDocument");
  let documentName = req.body.documentName;
  try {
    const [docDbResponse] = await db.query(
      `update documents set is_approved = 'approved', remark = null, updated_at = current_timestamp where DID = ${req.body.driver_id} and id = ${req.body.id}`
    );

    const [notificationDbResponse] = await db.query(`
      insert into notification (DID,message_subject,message_text,created_at) values (${req.body.driver_id}, '${documentName} approved', 'your ${documentName} has been successfully verified and approved by our administration',current_timestamp)
      `);

    // console.log(docDbResponse);
    return response(
      res,
      200,
      {
        docDbResponse: docDbResponse,
        notificationDbResponse: notificationDbResponse,
        span_text: "approved",
      },
      "Document approved successfully"
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};

export const approveVehical = async (req, res) => {
  console.log("inside approveVehical");
  try {
    const [vehicalDbResponse] = await db.query(
      `update driver set vehicle_approved = 'approved' where id = ${req.body.driver_id}`
    );
    return response(
      res,
      200,
      {
        vehicalDbResponse: vehicalDbResponse,
        span_text: "approved",
      },
      "vehicle approved successfully"
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};

export const rejectVehical = async (req, res) => {
  console.log("inside rejectVehical");
  try {
    const [vehicalDbResponse] = await db.query(
      `update driver set vehicle_approved = 'rejected' where id = ${req.body.driver_id}`
    );
    return response(
      res,
      200,
      {
        vehicalDbResponse: vehicalDbResponse,
        span_text: "rejected",
      },
      "vehicle rejected successfully"
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};

export const driverRequestFinalSubmit = async (req, res) => {
  console.log("inside driverRequestFinalSubmit");
  let vehical_approval_status = true;
  let document_approval_status = true;
  let reason = "";
  let document_approval_arr = [];
  let mailOptions;

  if (req.body.vehical_remark != null) {
    vehical_approval_status = false;
  }

  try {
    const [docDbResponse] = await db.query(`
    select * from document_list as dl join documents as d on dl.id = d.document_id where d.DID = ${req.body.driver_id} and dl.id != 6`);

    docDbResponse.forEach((e) => {
      if (e.is_approved !== "approved") {
        document_approval_status = false;
        document_approval_arr.push(e);
      }
    });

    document_approval_arr.forEach((e) => {
      reason += `${e.remark} of ${e.document_name}, `;
    });

    if (vehical_approval_status && document_approval_status) {
      const [driverDbResponse] = await db.query(
        `update driver set document_status = 'approved' , vehicle_approved = 'approved' where id = ${req.body.driver_id}`
      );
      mailOptions = {
        from: process.env.EMAIL,
        to: `${req.body.email}`,
        subject: "Uber driver request approval",
        html: `<p>Dear ${req.body.driver_name},</p>
        <p>We are pleased to inform you that your documents and vehicle details have been successfully verified and approved.
        You are now eligible to start driving with Uber!</p>
        <h3>Next Steps:</h3>
        <ul>
            <li>✅ Log in to your Uber Driver app and ensure your profile is complete.</li>
            <li>✅ Start accepting ride requests and providing excellent service to riders.</li>
            <li>✅ If you have any questions, feel free to reach out to our support team at <a href="mailto:support@uber.com">support@uber.com</a>.</li>
        </ul>
        <p>We are excited to have you on board and wish you a great journey ahead with Uber.</p>
        <h3>Welcome to the Uber family! 🎉</h3>
        <br>
        <p>Best regards,</p>
        <p>Uber Admin Team</p>`,
      };
    } else if (!vehical_approval_status && !document_approval_status) {
      const [driverDbResponse] = await db.query(
        `update driver set document_status = 'rejected' , vehicle_approved = 'rejected' where id = ${req.body.driver_id}`
      );
      mailOptions = {
        from: process.env.EMAIL,
        to: `${req.body.email}`,
        subject: "Notification of Verification Request Rejection",
        html: `<p>Dear ${req.body.driver_name},</p>
               <p>Thank you for submitting your documents and vehicle details for verification with Uber. 
               After a thorough review, we regret to inform you that your request has been declined due to <strong>${reason} and ${req.body.vehical_remark}</strong>.</p>
               <p>To proceed with your registration, please ensure that:</p>
               <ul>
                   <li>Provide any missing or correct documents, if applicable.</li>
                   <li>Ensure your vehicle meets all required criteria.</li>
               </ul>
               <p>If you believe this decision was made in error or if you wish to reapply after addressing the mentioned concerns, 
               please feel free to submit your updated details through the Uber platform.</p>
               <p>For further assistance, you can reach out to our support team at support@uber.com.</p>
               <p>We appreciate your interest in partnering with Uber and look forward to assisting you.</p>
               <br>
               <p>Best regards,</p>
               <p>Uber Admin Team</p>`,
      };
    } else if (!vehical_approval_status && document_approval_status) {
      const [driverDbResponse] = await db.query(
        `update driver set document_status = 'approved' , vehicle_approved = 'rejected' where id = ${req.body.driver_id}`
      );
      mailOptions = {
        from: process.env.EMAIL,
        to: `${req.body.email}`,
        subject: "Notification of Verification Request Rejection",
        html: `<p>Dear ${req.body.driver_name},</p>
               <p>Thank you for submitting your documents and vehicle details for verification with Uber. 
               After a thorough review, we regret to inform you that your request has been declined due to <strong>${req.body.vehical_remark}</strong>.</p>
               <p>To proceed with your registration, please ensure that:</p>
               <ul>
                   <li>Provide any missing or correct documents, if applicable.</li>
                   <li>Ensure your vehicle meets all required criteria.</li>
               </ul>
               <p>If you believe this decision was made in error or if you wish to reapply after addressing the mentioned concerns, 
               please feel free to submit your updated details through the Uber platform.</p>
               <p>For further assistance, you can reach out to our support team at support@uber.com.</p>
               <p>We appreciate your interest in partnering with Uber and look forward to assisting you.</p>
               <br>
               <p>Best regards,</p>
               <p>Uber Admin Team</p>`,
      };
    } else if (vehical_approval_status && !document_approval_status) {
      const [driverDbResponse] = await db.query(
        `update driver set document_status = 'rejected' , vehicle_approved = 'approved' where id = ${req.body.driver_id}`
      );
      mailOptions = {
        from: process.env.EMAIL,
        to: `${req.body.email}`,
        subject: "Notification of Verification Request Rejection",
        html: `<p>Dear ${req.body.driver_name},</p>
               <p>Thank you for submitting your documents and vehicle details for verification with Uber. 
               After a thorough review, we regret to inform you that your request has been declined due to <strong>${reason}</strong>.</p>
               <p>To proceed with your registration, please ensure that:</p>
               <ul>
                   <li>Provide any missing or correct documents, if applicable.</li>
                   <li>Ensure your vehicle meets all required criteria.</li>
               </ul>
               <p>If you believe this decision was made in error or if you wish to reapply after addressing the mentioned concerns, 
               please feel free to submit your updated details through the Uber platform.</p>
               <p>For further assistance, you can reach out to our support team at support@uber.com.</p>
               <p>We appreciate your interest in partnering with Uber and look forward to assisting you.</p>
               <br>
               <p>Best regards,</p>
               <p>Uber Admin Team</p>`,
      };
    } else {
      return errorResponse(res, 500, "Something went wrong ");
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return errorResponse(res, 500, error.message);
      } else {
        console.log("Email sent: " + info.response);
        return response(
          res,
          200,
          {
            info: info.response,
          },
          "Mail sent succesfully"
        );
      }
    });
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

// REPORT PAGE APIS

export const paymentOverview = async (req, res) => {
  console.log("inside paymentOverview");

  try {
    const [totalRevenue] = await db.query(
      `select sum(admin_cut) as totalRevenue from admin_revenue`
    );
    const [totalTansactionsCount] = await db.query(
      `select count(*) as totalTransactions from payment`
    );
    const [failedTansactionsCount] = await db.query(
      `select count(*) as totalFailedTransactions, sum(fare_amount) as failedTransactionsAmount from payment where status = 'failed'`
    );
    return response(
      res,
      200,
      {
        totalRevenue,
        totalTansactionsCount,
        failedTansactionsCount,
      },
      "Payment overview list fetched successfully"
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const todaysRidesDetails = async (req, res) => {
  console.log("inside todaysRidesDetails");
  // select t.user_id, t.DID, t.fare_amount, t.status, d.user_id, d.id from trip as t join driver as d on t.DID = d.id

  // -- select t.user_id, t.DID, t.fare_amount, t.status, d.user_id, d.id from trip as t join driver as d on t.DID = d.id
  // select * from trip as t join uber_user as u on u.id = t.user_id join driver as d on d.id = t.DID join uber_user as ud on ud.id = d.user_id
  try {
    const [todaysTotalRides] = await db.query(
      `SELECT  t.id AS trip_id, t.created_at AS date_of_journey, t.fare_amount AS amount, t.status AS trip_status, USER.id AS user_id, USER.first_name AS user_firstname, USER.last_name AS user_lastname, driver.user_id AS driver_id, driver.id AS driver_DID, ud.first_name AS driver_firstname, ud.last_name AS driver_lastname, p.id AS payment_id, p.mode AS payment_mode FROM trip AS t JOIN uber_user AS USER ON USER.id = t.user_id JOIN driver AS driver ON driver.id = t.DID JOIN uber_user AS ud ON ud.id = driver.user_id JOIN payment AS p ON p.trip_id = t.id WHERE t.drop_time >=  CURDATE()`
    );

    const [todaysCompletedRides] = await db.query(
      `SELECT  t.id AS trip_id, t.created_at AS date_of_journey, t.fare_amount AS amount, t.status AS trip_status, USER.id AS user_id, USER.first_name AS user_firstname, USER.last_name AS user_lastname, driver.user_id AS driver_id, driver.id AS driver_DID, ud.first_name AS driver_firstname, ud.last_name AS driver_lastname, p.id AS payment_id, p.mode AS payment_mode FROM trip AS t JOIN uber_user AS USER ON USER.id = t.user_id JOIN driver AS driver ON driver.id = t.DID JOIN uber_user AS ud ON ud.id = driver.user_id JOIN payment AS p ON p.trip_id = t.id WHERE t.status = 'completed' AND t.drop_time >=  CURDATE()`
    );

    const [todaysCancelledRides] = await db.query(
      `SELECT  t.id AS trip_id, t.created_at AS date_of_journey, t.fare_amount AS amount, t.status AS trip_status, USER.id AS user_id, USER.first_name AS user_firstname, USER.last_name AS user_lastname, driver.user_id AS driver_id, driver.id AS driver_DID, ud.first_name AS driver_firstname, ud.last_name AS driver_lastname, p.id AS payment_id, p.mode AS payment_mode FROM trip AS t JOIN uber_user AS USER ON USER.id = t.user_id JOIN driver AS driver ON driver.id = t.DID JOIN uber_user AS ud ON ud.id = driver.user_id JOIN payment AS p ON p.trip_id = t.id WHERE t.status = 'cancelled' AND t.drop_time >=  CURDATE()`
    );

    return response(
      res,
      200,
      {
        todaysTotalRides,
        todaysCompletedRides,
        todaysCancelledRides,
      },
      "todays Rides list fetched successfully"
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const topPerformingDrivers = async (req, res) => {
  console.log("inside topPerformingDrivers");
  try {
    const [topPerformingDriversList] = await db.query(
      `SELECT d.id AS driver_id, u.first_name, u.last_name, ROUND(AVG(t.rating_count), 1) AS rating, COUNT(t.id) AS completed_rides, SUM(t.fare_amount) AS earning FROM driver AS d  JOIN trip AS t ON d.id = t.DID  JOIN uber_user AS u ON u.id = d.user_id  WHERE t.status = 'completed'  GROUP BY d.id ORDER BY rating DESC`
    );

    const [mostRidesCompletedDrivers] = await db.query(
      `SELECT d.id AS driver_id, u.first_name, u.last_name, round( AVG(t.rating_count),1) AS rating, COUNT(t.id)AS completed_rides, SUM(t.fare_amount) AS earning FROM driver AS d JOIN trip AS t ON d.id = t.DID JOIN uber_user AS u ON u.id = d.user_id WHERE t.status = 'completed' GROUP BY t.DID order by count(t.id) desc `
    );

    const [lowRatedDrivers] = await db.query(
      `SELECT d.id AS driver_id, u.first_name, u.last_name, ROUND(AVG(t.rating_count), 1) AS rating, COUNT(t.id) AS completed_rides, SUM(t.fare_amount) AS earning FROM driver AS d  JOIN trip AS t ON d.id = t.DID  JOIN uber_user AS u ON u.id = d.user_id  WHERE t.status = 'completed'  GROUP BY d.id  HAVING ROUND(AVG(t.rating_count), 1) < 4  ORDER BY ROUND(AVG(t.rating_count), 1) ASC`
    );
    return response(
      res,
      200,
      {
        topPerformingDriversList,
        mostRidesCompletedDrivers,
        lowRatedDrivers,
      },
      "top performing driver list fetched succesfully"
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [Drivers] = await db.query(
      `SELECT uu.*, d.* FROM uber_user AS uu JOIN driver AS d ON uu.id=d.user_id`
    );

    const [Riders] = await db.query(
      `SELECT * FROM uber_user WHERE id NOT IN (SELECT user_id FROM driver)`
    );

    return response(
      res,
      200,
      {
        Drivers,
        Riders,
      },
      "all users list fetched succesfully"
    );
  } catch (err) {
    return errorResponse(res, 500, err.message);
  }
};

export const getDriverDetails = async (req, res) => {
  console.log("inside getDriverDetails");
  let driver_id = req.body.driver_id;
  try {
    const [driver_details] = await db.query(
      `select d.id as driver_id,d.*, u.* from driver as d join uber_user as u on u.id = d.user_id where d.id = ${driver_id}`
    );

    const [vehicalDetails] = await db.query(
      `SELECT * FROM vehicle WHERE DID = ${driver_id}`
    );

    const [totalRides] = await db.query(
      `SELECT COUNT(*) AS totalRides FROM trip WHERE DID = ${driver_id}`
    );

    const [topPerformingDriversList] = await db.query(
      `SELECT d.id AS driver_id, ROUND(AVG(t.rating_count), 1) AS rating, COUNT(t.id) AS completed_rides, SUM(t.fare_amount) AS earning FROM driver AS d JOIN trip AS t ON d.id = t.DID  WHERE t.status = 'completed' AND d.id = ${driver_id} GROUP BY d.id ORDER BY rating;`
    );

    return response(
      res,
      200,
      {
        driver_details: driver_details,
        vehicalDetails: vehicalDetails,
        totalRides: totalRides,
        topPerformingDriversList: topPerformingDriversList,
      },
      "data of driver request fetched successfully"
    );
  } catch (err) {
    console.log(err);
    return errorResponse(res, 500, err.message);
  }
};
