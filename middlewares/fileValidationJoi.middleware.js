import { errorResponse } from "../utils/helper.js";
import { driverDocumentSchema } from "../validationSchema/driverDocumentSchema.js";

export const fileValidationJoi = (req, res, next) => {
  // const { file } = req;
  // console.log(req.file);
  // console.log(file);
  if (req?.files) {
    // const { RC_BOOK, PUC, Insurance } = req.files;
    // console.log("files from middleware");
    // console.log(RC_BOOK[0]);
    // console.log(PUC[0]);
    // console.log(Insurance[0]);
    console.log(req?.files);
    
    const files = [req?.files?.RC_BOOK && req?.files?.RC_BOOK[0] , req?.files?.PUC && req?.files?.PUC[0], req?.files?.Insurance && req?.files?.Insurance[0]];
    let count = 0;
    files.forEach(async (file) => {
      try {
        const { error } = driverDocumentSchema.validate({
          file: file,
          size: file.size,
        });
        if (error) {
          return errorResponse(res, 400, error.details[0].message);
        }
        count++;
        if (count === 3) {
          next();
        }
      } catch (error) {
        console.log(error);
        return errorResponse(res, 500, "Error uploading document");
      }
    });
  } else {
    const { error } = driverDocumentSchema.validate({
      file: req?.file,
      size: req?.file?.size,
    });

    if (error) {
      return errorResponse(res, 400, error.details[0].message);
    }
  }

  next();
};
