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
adminRoutes.get("/get-chart-data", getChartData);
adminRoutes.post("/custom-revenue", customRevenue);
adminRoutes.get("/driver-request", driverRequest);
adminRoutes.get("/driver-rejected-request", driverRejectedRequest);
adminRoutes.post("/get-one-driver-request", getOneDriverRequest);
adminRoutes.post("/approve-document", approveDocument);
adminRoutes.post("/submit-rejection-document", submitRejectDocument);
adminRoutes.post("/approve-vehical", approveVehical);
adminRoutes.post("/reject-vehical", rejectVehical);
adminRoutes.post("/driver-request-final-submit", driverRequestFinalSubmit);

// report page apis
adminRoutes.get("/payment-overview", paymentOverview);
adminRoutes.get("/todays-rides-details", todaysRidesDetails);
adminRoutes.get("/top-performing-drivers", topPerformingDrivers);

//profile page apis
adminRoutes.get("/users", getAllUsers);
adminRoutes.post("/driver", getDriverDetails);

adminRoutes.get("/get-chart-data", getChartData);

export { adminRoutes };
