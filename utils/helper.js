export const response = (res, statusCode, dataObject, message) => {
  return res.status(statusCode).json({
    data: dataObject,
    message: message,
  });
};

export const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    error: message,
    statusCode: statusCode,
  });
};
