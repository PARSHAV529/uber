export const driverLandingPage = async (req, res) => {
  res.render("driver/driverLandingPage");
};

export const driverHomePage = async (req, res) => {
  res.render("driver/home");
};

export const driverRidesPage = async (req, res) => {
  res.render("driver/rides");
};

export const driverPaymentsPage = async (req, res) => {
  res.render("driver/payments");
};

export const driverHistoryPage = async (req, res) => {
  res.render("driver/history");
};

export const driverSettingPage = async (req, res) => {
  res.render("driver/settings");
};

export const driverNotificationsPage = async (req, res) => {
  res.render("driver/notifications");
};

export const driverProfilePage = async (req, res) => {
  res.render("driver/profile");
};

export const driverQrPage = async (req, res) => {
  res.render("driver/qrCodePage");
};

export const driverDocumentsPage = async (req, res) => {
  res.render("driver/uploadDocument");
};

export const drievrRideAccept = async (req, res) => {
  res.render("driver/driverRideAccepted");
};
