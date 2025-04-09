import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log(file);
    
    if (file.mimetype != "image/png" && file.mimetype != "image/jpeg" && file.mimetype != "image/jpg" && file.mimetype != "file/pdf") {
        return cb(
            new Error(
              "Invalid File Type. Only PNG, JPEG, and JPG are allowed."
            )
          );
    } else {
      cb(null, true);
    }
     
    
    
      
    
  },
});

export const handleDriverDocument = upload;
