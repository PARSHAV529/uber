import streamifier from "streamifier";
import cloudinary from "cloudinary";
import { vehicleFormSchema } from "../validationSchema/vehicleDetailsFormSchema.js";

import { errorResponse } from "../utils/helper.js";
const v2 = cloudinary.v2;
v2.config({
  cloud_name: "dl0uptvec",
  api_key: "785242373158836",
  api_secret: "LzntOchq0bdHn671E5v4EnLm3fM",
});

const CloudinaryUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = v2.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const handleDriverDocumentCloudinary = async (req, res, next) => {
  if (req.files) {
    if (Object.keys(req.files).length > 0) {
      
   
    const { RC_BOOK, PUC, Insurance } = req.files;

    let vehicleDetails = {
      type: req.body.type,
      colour: req.body.colour,
      Number_plate: req.body.Number_plate,
      PUC_Exp_date: req.body.PUC_Exp_date,
      insurance_Exp_date: req.body.insurance_Exp_date,
    };

    const { error } = vehicleFormSchema.validate(vehicleDetails);

    if (error) {
      return errorResponse(res, 400, `${error.message}`);
    } else {
      const files = [RC_BOOK[0], PUC[0], Insurance[0]];
      let count = 0;
      files.forEach(async (file) => {
        try {
          const result = await CloudinaryUpload(file.buffer);
          file.url = result.url;
          if (count === 2) {
            next();
          }
          count++;
        } catch (error) {
          console.log(error);
          errorResponse(res, 500, "Error uploading document");
        }
      });
    }
  }else{
    errorResponse(res, 400, "RC book or PUC or Insurance not attached !!");
  }
  } else if (req.file) {
    try {
      if (req.file.size > 5 * 1024 * 1024) {
        return errorResponse(
          res,
          500,
          "File is too large, maximum size is 5MB"
        );
      } else {
        const result = await CloudinaryUpload(req.file.buffer);
        // console.log(result);
        req.file = result;
        next();
      }
    } catch (error) {
      // console.log(error);
      errorResponse(res, 500, "Error uploading document");
    }
  } else {
    next();
  }

  // if (req.file.size > 5 * 1024 * 1024) {
  //   return errorResponse(res, 500, "File is too large, maximum size is 5MB");
  // } else {
  //   if (req.files) {
  //     const { RC_BOOK, PUC, Insurance } = req.files;
  //     const files = [RC_BOOK[0], PUC[0], Insurance[0]];
  //     let count = 0;
  //     files.forEach(async (file) => {
  //       try {
  //         const result = await CloudinaryUpload(file.buffer);
  //         // console.log(result);
  //         file.url = result.url;
  //         if (count === 2) {
  //           next();
  //         }
  //         count++;
  //       } catch (error) {
  //         // console.log(error);
  //         errorResponse(res, 500, "Error uploading document");
  //       }
  //     });
  //   } else if (req.file) {
  //     try {
  //       const result = await CloudinaryUpload(req.file.buffer);
  //       // console.log(result);
  //       req.file = result;
  //       next();
  //     } catch (error) {
  //       // console.log(error);
  //       errorResponse(res, 500, "Error uploading document");
  //     }
  //   } else {
  //     next();
  //   }
  // }
};
