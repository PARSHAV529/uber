import jwt from "jsonwebtoken";

export const generateToken = (data, user_role) => {
  if (user_role === "driver") {
    // console.log("user_role", user_role);

    const token = jwt.sign(data, process.env.DRIVER_JWT_SECRETKEY);

    return token;
  } else {
    const token = jwt.sign(data, process.env.RIDER_JWT_SECRETKEY);
    return token;
  }
};

export const commonToken = (data) => {

  const token = jwt.sign(data, process.env.EMAIL_AUTH_SECRETKEY)

  return token;
}
