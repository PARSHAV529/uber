import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function verifyRiderLogin(req, res, next) {
  // console.log("route verify");

  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

  let loginToken = req.cookies.accessToken;
  // console.log(req.cookies);
  // console.log(req.headers);
  // console.log(req.headers["x-requested-with"] === "XMLHttpRequest");

  if (!loginToken) {
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.status(203).json({
        message: "Access Denied! No token provided.",
      });
    }
    return res.redirect("/uber/signup");
  }

  jwt.verify(loginToken, process.env.RIDER_JWT_SECRETKEY, (err, auth) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        if (req.headers["x-requested-with"] === "XMLHttpRequest") {
          return res.status(401).json({
            message: "Access Denied! Token has expired.",
          });
        }
        return res.redirect("/uber/signup");
      } else {
        console.error(err);
        if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res.status(403).json({
          message: "Access Denied! Invalid token.",
        });
      }
      return res.redirect('/uber/signup')
      }
    }
    // console.log(auth, "token");
    req.user = auth;
    // console.log(auth.id,"user_id");
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
    return res.status(200).json({ message: "Successful" });
    }
    res.locals.user_id = auth.id;
    console.log("to the next");
    next();
  });
}

