import jwt from "jsonwebtoken";

export const generateToken = (data, user_role) => {
  if (user_role === "driver") {
    console.log("user_role", user_role);

    const token = jwt.sign(data, process.env.DRIVER_JWT_SECRETKEY);
    console.log("data", data);

    console.log(token);

    return token;
  } else {
    const token = jwt.sign(data, process.env.RIDER_JWT_SECRETKEY);

    return token;
  }
};
