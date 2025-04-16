import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("inside multer file filter");

    console.log(req.body);
    console.log(file);
    
    if (file.mimetype != "image/png" && file.mimetype != "image/jpeg" && file.mimetype != "image/jpg" && !file.mimetype.includes('pdf')) {
        return cb(
            new Error(
              "Invalid File Type. Only PNG, JPEG, JPG and PDFs are allowed."
            )
          );
    } else {
      cb(null, true);
    }
  },
});

const uploadVehicleFiles = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("inside multer file filter");

    // console.log(req.body);
    

      if (
        file.mimetype != "image/png" &&
        file.mimetype != "image/jpeg" &&
        file.mimetype != "image/jpg" &&
        file.mimetype != "file/pdf"
      ) {
        return cb(
          new Error("Invalid File Type. Only PNG, JPEG, and JPG are allowed.")
        );
      } else {
        cb(null, true);
      }
    }
});

const handleDriverDocument = upload;
const handleVehicleDocuments = uploadVehicleFiles;
export { handleDriverDocument, handleVehicleDocuments };
