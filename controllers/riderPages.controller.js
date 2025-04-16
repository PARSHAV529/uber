export const aboutus = async (req, res) => {
  res.render("rider/about");
};

const riderRideSetupPage = async (req, res) => {
  res.render("rider/riderRideSetup", { data: req.query });
};

const rideRequestPage = async (req, res) => {
  res.render("rider/rideRequest", {
    source: req.query.source,
    destination: req.query.destination,
    vehicleType: req.query.vehicletype,
  });
};

const riderRideAcceptedPage = async (req, res) => {
  // console.log("you are in common rendering page");
  res.render("rider/riderRideAccepted");
};

const riderHistoryPage = async (req, res) => {
  res.render("rider/riderRideHistory");
};

const riderProfilePage = async (req, res) => {
  res.render("rider/riderProfile");
};

const riderSecurityPage = async (req, res) => {
  res.render("rider/riderSecurity");
};

const riderPrivacyPage = async (req, res) => {
  res.render("rider/riderPrivacy");
};

export {
  rideRequestPage,
  riderHistoryPage,
  riderPrivacyPage,
  riderProfilePage,
  riderRideAcceptedPage,
  riderSecurityPage,
  riderRideSetupPage,
};
