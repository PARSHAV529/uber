import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
// const io_server = require("http").createServer();
import http from "http";
const io_server = http.createServer();
import QRCode from "qrcode";
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
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

import { adminRoutes } from "./routes/admin.route.js";
import driverSignupRouter from "./routes/auth.route.js";
import { authRouter } from "./routes/auth.route.js";
import riderRequest from "./routes/driver.route.js";
import loginRouter from "./routes/login.route.js";
import driverRouter from "./routes/driver.route.js";
import riderRouter from "./routes/rider.route.js";
import { setIo, getIo, ioInstance } from "./socket.js";

//import your routes here
app.use("/", driverSignupRouter);
app.use("/uber/api", loginRouter);
app.use("/uber/api", authRouter);
app.use("/uber/api", riderRequest);
app.use("/", driverRouter);
app.use("/uber/api", loginRouter);
app.use("/uber/api/driver", driverRouter);
app.use("/uber/api", riderRouter);
app.use("/uber/api/admin", adminRoutes);

import { router } from "./routes/auth.route.js";
import db from "./config/dbConnection.js";
import { jwtDecode } from "jwt-decode";
app.use("/uber/api", router);

//render your frontend page here
// app.get("/uber/rider/go/:start?/:dest?", (req, res) => {
//   // console.log(req.query);
//   res.render("rider/riderRideSetup", { data: req.query });
// });

// //waiting for driver to accept ride request page
// app.get("/uber/rider/request", (req, res) => {
//   // console.log(req.query);
//   res.render("rider/rideRequest", {
//     source: req.query.source,
//     destination: req.query.destination,
//   });
// });
// //rider rides history page
// app.get("/uber/rider/history", (req, res) => {
//   res.render("rider/riderRideHistory");
// });

// //rider profile
// app.get("/uber/rider/profile", (req, res) => {
//   res.render("rider/riderProfile");
// });

// //rider security
// app.get("/uber/rider/security", (req, res) => {
//   res.render("rider/riderSecurity");
// });

// //rider privacy
// app.get("/uber/rider/privacy", (req, res) => {
//   res.render("rider/riderPrivacy");
// });

// //rider's ride request accepted and will se driver details here
// app.get("/uber/rider/accepted", (req, res) => {
//   res.render("rider/riderRideAccepted");
// });
//app.get("end point of frontend",(req,res) => res.render("ejs file name"))
app.get("/", (req, res) => res.render("rider/rider"));
app.get("/rider", (req, res) => res.render("rider"));

// ----------------------------------------------------------

import commonPages from "./routes/commonPages.route.js";
import driverPages from "./routes/driverPages.route.js";
import { handleSocketConnection } from "./controllers/rider.controller.js";
import adminpages from "./routes/adminPages.route.js";
import riderPages from "./routes/riderPages.route.js";

app.use("/uber", commonPages);
app.use("/uber/driver", driverPages);
app.use("/uber/admin", adminpages);
app.use("/uber/rider", riderPages);

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

// const IO_Server = app.listen(3000, () => {
//   console.log(`IO Server :  http://localhost:3000`);
// });
const ride_io = new Server(io_server, {
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
// io.on("update-driver-location", (data) => {
//   console.log(data);
// }
// );
handleSocketConnection(io);

ride_io.on("connection", (socket) => {
  socket.on("update-driver-location", async (data) => {
    console.log("Ride on : ",data)
    ride_io.emit(`driver-location/${data.decoded.id}`, data);
  });
});
