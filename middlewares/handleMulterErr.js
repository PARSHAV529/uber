import multer from "multer";
import { errorResponse } from "../utils/helper.js";
export const handleMulterErr = (err, req, res, next) => {
  
  console.log(err instanceof multer.MulterError);
  
  if (err instanceof multer.MulterError) {
    // if (err.code === "LIMIT_FILE_SIZE") {
    //   return res.status(500).json({ fileerror: ["file is too large"] });
    //   //   next();
    // }

return errorResponse(res, 500, err.message);
    // return res.status(500).json({ fileerror: [err.message] });
    // next();
  } else if (err) {
    console.log(err.message);
    
    return errorResponse(res, 500, err.message);
    // return res.status(500).json({ fileerror: [err.message] });
    // next();
  }
  // next();
};
