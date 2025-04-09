import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";


const app = express();
const __dirname = path.resolve();

//middlewares
app.set("view engine", "ejs");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static(path.join(__dirname + "/public")));
app.use(cookieParser());

import { adminRoutes } from "./routes/admin.route.js";
import cors from "cors";
import QRCode from "qrcode";

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

import driverSignupRouter from "./routes/auth.route.js";
import { authRouter } from "./routes/auth.route.js";
import riderRequest from "./routes/driver.route.js";
import loginRouter from "./routes/login.route.js";
import driverRouter from "./routes/driver.route.js";
import getHistoryrouter from "./routes/rider.route.js";
import { setIo,getIo,ioInstance } from "./socket.js";

//import your routes here
app.use("/", driverSignupRouter);
app.use("/", driverSignupRouter);
app.use("/uber/api", loginRouter);
app.use("/uber/api", authRouter);
app.use("/uber/api", riderRequest);
app.use("/", driverRouter);
app.use("/uber/api", loginRouter);
app.use("/uber/api/driver", driverRouter);
app.use("/uber/api", getHistoryrouter);

// import {your route name } from "diractories/fileName.js"
// app.use("/uber/api",your route name)

app.use("/uber/api/admin", adminRoutes);

//render your frontend page here

app.get("/uber/admin/login", (req, res) => {
  res.render("admin/adminLogin");
});

app.get("/uber/admin", (req, res) => {
  res.render("admin/dashboard");
});

app.get("/uber/admin/documents", (req, res) => {
  res.render("admin/documents");
});

app.get("/uber/admin/reports", (req, res) => {
  res.render("admin/reports");
});

// app.get("/uber/admin/doc-verification", (req, res) => {
//   res.render("admin/docVerification");
// });

app.get("/uber/admin/doc-verification", (req, res) => {
  // res.send(`admin/docVerification ${req.params.driver_id}}`);

  res.render("admin/docVerification");
});

app.get("/uber/admin/users", (req, res) => {
  res.render("admin/allUsers");
});

app.get("/uber/admin/driver-detail", (req, res) => {
  res.render("admin/adminDriverProfile");
});

import { router } from "./routes/auth.route.js";
import db from "./config/dbConnection.js";
import { jwtDecode } from "jwt-decode";
app.use("/uber/api", router);

//render your frontend page here
app.get("/uber/rider/go/:start?/:dest?", (req, res) => {
  console.log(req.query);
  res.render("rider/riderRideSetup", { data: req.query });
});

//waiting for driver to accept ride request page
app.get("/uber/rider/request", (req, res) => {
  console.log(req.query);
  res.render("rider/rideRequest",{source:req.query.source,destination:req.query.destination});
});
//rider rides history page
app.get("/uber/rider/history", (req, res) => {
  res.render("rider/riderRideHistory");
});

//rider profile
app.get("/uber/rider/profile", (req, res) => {
  res.render("rider/riderProfile");
});

//rider security
app.get("/uber/rider/security", (req, res) => {
  res.render("rider/riderSecurity");
});

//rider privacy
app.get("/uber/rider/privacy", (req, res) => {
  res.render("rider/riderPrivacy");
});

//rider's ride request accepted and will se driver details here
app.get("/uber/rider/accepted", (req, res) => {
  res.render("rider/riderRideAccepted");
});
//app.get("end point of frontend",(req,res) => res.render("ejs file name"))
app.get("/", (req, res) => res.render("rider/rider"));
app.get("/rider", (req, res) => res.render("rider"));

app.get("/driver/payments", (req, res) => {
  res.render("driver/payments");
});

//app.get("end point of frontend",(req,res) => res.render("ejs file name"))
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/otp-varification", (req, res) => {
  res.render("otpVarification");
});
app.get("/create-profile", (req, res) => {
  res.render("createProfile");
});
app.get("/driver/dashboard", (req, res) => {
  res.render("driver/dashboard");
});

app.set("view engine", "ejs");
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/", driverSignupRouter);

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/otp-varification", (req, res) => {
  res.render("otpVarification");
});
app.get("/create-profile", (req, res) => {
  res.render("createProfile");
});
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "/public")));

app.get("/login", (req, res) => {
  res.render("Login");
});
app.get("/forgot-password", (req, res) => {
  res.render("forgotPassword");
});
app.get("/forgot-password", (req, res) => {
  res.render("forgotPassword");
});
app.get("/driver/home", (req, res) => {
  res.render("driver/home");
});
app.get("/driver/hometemp", (req, res) => {
  res.render("driver/homeTemp");
});
app.get("/driver", (req, res) => {
  res.render("driver/driverLandingPage");
});
app.get("/driver/rides", (req, res) => {
  res.render("driver/rides");
});
app.get("/driver/payments", (req, res) => {
  res.render("driver/payments");
});
app.get("/driver/history", (req, res) => {
  res.render("driver/history");
});
app.get("/driver/settings", (req, res) => {
  res.render("driver/settings");
});

// ----------------------------------------------------------
app.get("/driver/notifications", (req, res) => {
  res.render("driver/notifications");
});
app.get("/driver/profile", (req, res) => {
  res.render("driver/profile");
});

app.get("/driver/qr-page", (req, res) => {
  res.render("driver/qrCodePage");
});
const PORT = process.env.PORT || 8080;

const httpServer = app.listen(PORT, () => {
  console.log(`server is live on port http://localhost:${PORT}`);
});
const io = new Server(httpServer, {
  cors: {
    
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setIo(io);
// io.on("connection", (socket) => {
//   console.log(socket.id);
// });

io.on("connection", (socket) => {
  console.log("soket connected");
  // console.log(socket.id);
  // io.on("disconnect", () => {
  //   console.log("user disconnected");
  // });
  let count=0;
  socket.on('update-driver-location', async(data) => {
    // console.log(data.decoded)
    console.log(count++);
      // const decoded = jwtDecode(req.cookies.accessToken);
      // const userId = decoded.id;
   const [result]= await db.execute('update driver set live_location=? where id =?',[JSON.stringify(data),data.decoded.id]);
    io.emit('driver-location', data)
    console.log(result);
    
  }
  );
}
);
io.on("update-driver-location", (data) => {
  console.log(data);
}
);
