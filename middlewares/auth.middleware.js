import jwt from "jsonwebtoken";
import { response, errorResponse } from "../utils/helper.js";

export const authUser = (req, res, next) => {
  try {
    if (!req.cookies.accessToken) {
      res.redirect("/uber/driver");
    } else {
      next();
    }
  } catch (error) {
    // console.log(`authUser : Error : ${error}`);
  }
};

export const authSignup = async (req, res, next) => {
  try {
    if (req.cookies.createProfileToken) {
      res.redirect("/uber/create-profile");
    } else {
      next();
    }
  } catch (error) {
    // console.log(`authSignup : Error : ${error}`);
  }
};

export const authCreateProfile = (req, res, next) => {
  try {
    if (!req.cookies.createProfileToken) {
      res.redirect("/uber/signup");
    } else {
      jwt.verify(
        req.cookies.createProfileToken,
        process.env.EMAIL_AUTH_SECRETKEY,
        (error, decoded) => {
          if (error) {
            res.clearCookie("createProfileToken");
            res.redirect("/uber/signup");
          } else {
            next();
          }
        }
      );
    }
  } catch (error) {
    // console.log(`authCreateProfile : Error : ${error.message}`);
  }
};

export const authApiCreateProfile = (req, res, next) => {
  try {
    if (!req.cookies.createProfileToken) {
      return response(
        res,
        401,
        { url: "/uber/signup" },
        `Access denied !! ${error.message}`
      );
    } else {
      jwt.verify(
        req.cookies.createProfileToken,
        process.env.EMAIL_AUTH_SECRETKEY,
        (error, decoded) => {
          if (error) {
            res.clearCookie("createProfileToken");
            return response(
              res,
              401,
              { url: "/uber/signup" },
              `Access denied !! ${error.message}`
            );
          } else {
            req.person = decoded;
            next();
          }
        }
      );
    }
  } catch (error) {
    // console.log(`authCreateProfile : Error : ${error.message}`);
  }
};

export const authEmail = (req, res, next) => {
  try {
    if (!req.cookies.emailToken) {
      res.redirect("/uber/signup");
    } else {
      jwt.verify(
        req.cookies.emailToken,
        process.env.EMAIL_AUTH_SECRETKEY,
        (error, decoded) => {
          if (error) {
            res.clearCookie("emailToken");
            res.redirect("/uber/signup");
          } else {
            next();
          }
        }
      );
    }
  } catch (error) {
    // console.log(`authEmail : Error : ${error}`);
  }
};

export const authDriver = async (req, res, next) => {
  try {
    if (!req.cookies.accessToken) {
      res.redirect("/");
    } else {
      jwt.verify(
        req.cookies.accessToken,
        process.env.DRIVER_JWT_SECRETKEY,
        (error, decoded) => {
          if (error) {
            res.clearCookie("accessToken");
            res.redirect("/uber/driver");
          } else {
            req.driver = decoded;
            next();
          }
        }
      );
    }
  } catch (error) {
    // console.log(`authDriver : Error : ${error.message}`);
  }
};

// export const authApiDriver = async (req, res, next) => {
//   try {
//     if (!req.cookies.accessToken) {
//       return
//     } else {
//       jwt.verify(
//         req.cookies.accessToken,
//         process.env.DRIVER_JWT_SECRETKEY,
//         (error, decoded) => {
//           if (error) {
//             res.clearCookie("accessToken");
//             res.redirect("/uber/driver");
//           } else {
//             console.log(decoded)
//             req.driver = decoded;
//             next();
//           }
//         }
//       );
//     }
//   } catch (error) {
//     console.log(`authDriver : Error : ${error.message}`);
//   }
// };

export const authAlreadyLog = async (req, res, next) => {
  try {
    if (req.cookies.accessToken) {
      jwt.verify(
        req.cookies.accessToken,
        process.env.RIDER_JWT_SECRETKEY,
        (error, decode) => {
          if (error) {
            jwt.verify(
              req.cookies.accessToken,
              process.env.DRIVER_JWT_SECRETKEY,
              (error, decode) => {
                if (error) {
                  res.clearCookie("accessToken");
                  res.redirect("/");
                } else {
                  res.redirect("/uber/driver/home");
                }
              }
            );
          } else {
            res.redirect("/");
          }
        }
      );
    } else {
      next();
    }
  } catch (error) {
    // console.log(`authAlreadyLog : Error : ${error.message}`);
  }
};
