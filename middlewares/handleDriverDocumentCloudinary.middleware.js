import streamifier from "streamifier";
import cloudinary from "cloudinary";
import { errorResponse } from "../utils/helper.js";
const v2 = cloudinary.v2;
v2.config({
  cloud_name: "dl0uptvec",
  api_key: "785242373158836",
  api_secret: "LzntOchq0bdHn671E5v4EnLm3fM",
});

// const CloudinaryUploadmultiplefile = (req,res) => {
  // return new Promise((resolve, reject) => {
    
  // })

// }
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
  console.log("klkl");

  console.log(req.file);
  // console.log(req.files);
  if (req.file.size > 5 * 1024 * 1024) {
   return  errorResponse(res, 500, "File is too large, maximum size is 5MB");
  }else{
   


  if (req.files) {
    const {RC_BOOK,PUC,Insurance} = req.files
const files=[RC_BOOK[0],PUC[0],Insurance[0]]
    let count=0
    files.forEach(async(file)=>{
      try {
        const result = await CloudinaryUpload(file.buffer);
        console.log(result);
        file.url = result.url;
        if(count === 2){
          next();
        }
        count++;
        
        
      } catch (error) {
        console.log(error);
        errorResponse(res, 500, "Error uploading document");
      }
    })
    
  } else if(req.file) {
    try {
      const result = await CloudinaryUpload(req.file.buffer);
      console.log(result);
      req.file = result;
      next();
    } catch (error) {
      console.log(error);
      errorResponse(res, 500, "Error uploading document");
    }
  }else{
    next()
  }
}
};
