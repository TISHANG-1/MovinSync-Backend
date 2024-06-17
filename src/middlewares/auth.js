import jwt from "jsonwebtoken";
import { RESPONSE_CODES, generateError } from "../utils/helper.js";
import User from "../models/User.js";
export const userAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "Malformed Request");
    }
    const token = authorization;
    if (token === undefined) {
      throw generateError(
        RESPONSE_CODES.BAD_REQUEST_CODE,
        "Authentication Token is Not Present"
      );
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw generateError(
        RESPONSE_CODES.UNAUTHORIZED_ERROR_CODE,
        "Not Authorized"
      );
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.log(err);
    const { status = RESPONSE_CODES.INTERNAL_SERVER_ERROR_CODE } = err;
    res
      .status(status)
      .send("Authorization Error. Please logout and login again!");
  }
};

export const authorizedRoles = (role) => {
  return (req, res, next) => {
    if (!checkAuth(role, req.user)) {
      throw generateError(
        RESPONSE_CODES.UNAUTHORIZED_ERROR_CODE,
        `Roles: ${req.user} is not allowed to access this resource`,
        403
      );
    }
    next();
  };
};

// helper functions not for export

const checkAuth = (role, user) => {
  if (role === "traveler") {
    return user.isTraveler;
  }
  if (role === "admin") {
    return user.isAdmin;
  }
  if (role === "travelerCompanion") {
    return user.isTravelerCompanion;
  }
};
