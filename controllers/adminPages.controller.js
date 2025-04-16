export const adminLogin = async (req, res) => {
  res.render("admin/adminLogin");
};

export const dashboard = async (req, res) => {
  res.render("admin/dashboard");
};

export const documents = async (req, res) => {
  res.render("admin/documents");
};

export const reports = async (req, res) => {
  res.render("admin/reports");
};

export const docVerification = async (req, res) => {
  res.render("admin/docVerification");
};

export const allUsers = async (req, res) => {
  res.render("admin/allUsers");
};

export const adminDriverProfile = async (req, res) => {
  res.render("admin/adminDriverProfile");
};
