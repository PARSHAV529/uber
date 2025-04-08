import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function verifyAdminLogin(req, res, next) {
  console.log("Inside verifyAdminLogin");

  let loginToken = req.cookies.adminLoginToken;

  if (!loginToken) {
    return res.status(403).json({
      message: "Access Denied! No token provided.",
    });
  }

  jwt.verify(loginToken, process.env.SECRETKEY, (err, auth) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Access Denied! Token has expired.",
        });
      } else {
        console.error(err);
        return res.status(403).json({
          message: "Access Denied! Invalid token.",
        });
      }
    }

    req.user = auth;
    next();
  });
}
