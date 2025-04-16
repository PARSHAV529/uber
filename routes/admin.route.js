import pkg from "express";
const { Router } = pkg;
const adminRoutes = Router();

import { verifyAdminLogin } from "../middlewares/admin.middleware.js";

import {
  postAdminLogin,
  activeDrivers,
  driverRequest,
  driverRejectedRequest,
  getOneDriverRequest,
  submitRejectDocument,
  approveDocument,
  protectedController,
  approveVehical,
  rejectVehical,
  driverRequestFinalSubmit,
  paymentOverview,
  todaysRidesDetails,
  topPerformingDrivers,
  getAllUsers,
  getChartData,
  getDriverDetails,
  customRevenue,
} from "../controllers/admin.controller.js";

adminRoutes.get("/protected-route", verifyAdminLogin, protectedController);

adminRoutes.post("/login", postAdminLogin);

// adminRoutes.get("/uber/admin/doc-verification/:driver_id", (req, res) => {

//   // res.send(`admin/docVerification ${req.params.driver_id}}`);

//   res.render("admin/docVerification" ,{ driver_id:req.params.driver_id});
// });

// dashboard apis
adminRoutes.get("/active-drivers", verifyAdminLogin, activeDrivers);
adminRoutes.get("/get-chart-data", verifyAdminLogin, getChartData);
adminRoutes.post("/custom-revenue", verifyAdminLogin, customRevenue);
adminRoutes.get("/driver-request", verifyAdminLogin, driverRequest);
adminRoutes.get(
  "/driver-rejected-request",
  verifyAdminLogin,
  driverRejectedRequest
);
adminRoutes.post(
  "/get-one-driver-request",
  verifyAdminLogin,
  getOneDriverRequest
);
adminRoutes.post("/approve-document", verifyAdminLogin, approveDocument);
adminRoutes.post(
  "/submit-rejection-document",
  verifyAdminLogin,
  submitRejectDocument
);
adminRoutes.post("/approve-vehical", verifyAdminLogin, approveVehical);
adminRoutes.post("/reject-vehical", verifyAdminLogin, rejectVehical);
adminRoutes.post(
  "/driver-request-final-submit",
  verifyAdminLogin,
  driverRequestFinalSubmit
);

// report page apis
adminRoutes.get("/payment-overview", verifyAdminLogin, paymentOverview);
adminRoutes.get("/todays-rides-details", verifyAdminLogin, todaysRidesDetails);
adminRoutes.get(
  "/top-performing-drivers",
  verifyAdminLogin,
  topPerformingDrivers
);

//profile page apis in admin
adminRoutes.get("/users", verifyAdminLogin, getAllUsers);
adminRoutes.post("/driver", verifyAdminLogin, getDriverDetails);

adminRoutes.get("/get-chart-data", verifyAdminLogin, getChartData);

export { adminRoutes };
