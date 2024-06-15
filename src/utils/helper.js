export const RESPONSE_CODES = {
  BAD_REQUEST_CODE: 400,
  INTERNAL_SERVER_ERROR_CODE: 500,
  UNAUTHORIZED_ERROR_CODE: 401,
  SUCCESS_CODE: 200,
  CREATED_CODE: 201,
  ACCESS_ERROR_CODE: 405,
  UNPROCESSABLE_ERROR_CODE: 422,
  NOT_FOUND_ERROR_CODE: 404,
  FORBIDDEN_ERROR_CODE: 403,
};

export const generateError = (status, message) => {
  let err = new Error(message);
  err.status = status;
  return err;
};
