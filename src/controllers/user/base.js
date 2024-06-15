import sendEmail from "../../utils/sendEmail.js";
import { RESPONSE_CODES, generateError } from "../../utils/helper.js";
import { sendSMS } from "../../utils/sendSMS.js";
import User from "../../models/User.js";

export const createUser = async (userParams) => {
  const { password, confirmPassword } = userParams;
  if (password !== confirmPassword) {
    throw generateError(
      RESPONSE_CODES.BAD_REQUEST_CODE,
      "passwords do not match"
    );
  }
  const user = await User.create({ ...userParams, isAdmin: false });
  if (!user) {
    throw generateError(
      RESPONSE_CODES.BAD_REQUEST_CODE,
      "User cannot be created"
    );
  }
  const { name, email, phoneNumber, isTraveler, isTravelerCompanion } = user;
  const token = await user.getJWTToken();
  return { name, email, phoneNumber, token, isTraveler, isTravelerCompanion };
};

export const loginUser = async (loginParams) => {
  const { email = "", phoneNumber = "", password = "" } = loginParams;
  let filter = getFilter(email, phoneNumber);
  const user = await User.findOne(filter).select(
    "+password name email isTraveler isTravelerCompanion"
  );
  if (!user) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "User not found");
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "Incorrect Password");
  }
  const token = user.getJWTToken();
  return { ...user._doc, password: undefined, token };
};

export const generateVerifyUserRequest = async (currentUser, type) => {
  const user = await User.findById(currentUser._id);
  if (!user) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "User not found");
  }
  const OTP = user.generateVerificationOTP(type);
  await user.save();
  sendVerficationRequest(currentUser, OTP, "Verification Request!!", type);
};

export const verifyUserRequest = async (currentUser, code, type) => {
  const user = await User.findById(currentUser._id);
  if (!user) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "User not found");
  }
  let verificationCode = "",
    verificationExpiryDate = "";
  if (type === "EMAIL") {
    verificationCode = currentUser.verificationCode.email;
    verificationExpiryDate = currentUser.verificationCode.email;
  } else if (type === "PHONE") {
    verificationCode = currentUser.verificationCode.phoneNumber;
    verificationExpiryDate = currentUser.verificationCode.phoneNumber;
  } else {
    throw generateError(
      RESPONSE_CODES.BAD_REQUEST_CODE,
      "INVALID_REQUEST_TYPE"
    );
  }
  if (new Date(verificationExpiryDate) < new Date()) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "REQUEST_EXPIRED");
  }
  if (parseInt(verificationCode) === parseInt(code)) {
    if (type === "EMAIL") {
      user.verificationCode.email = null;
      user.verificationExpiryDate.email = null;
      user.isVerified.email = true;
    } else {
      user.verificationCode.phoneNumber = null;
      user.verificationExpiryDate.phoneNumber = null;
      user.isVerified.phoneNumber = true;
    }
    await user.save();
  }
};

export const deleteUser = async (currentUser) => {
  await User.findByIdAndDelete(currentUser._id);
  return;
};

export const updateUser = async (currentUser, userParams) => {
  await User.findByIdAndUpdate(currentUser._id, {
    ...userParams,
    isAdmin: currentUser.isAdmin,
  });
  return;
};

// helper function not to EXPORT

const getFilter = (email, phoneNumber) => {
  let filter = {};
  filter = email.length ? { email } : filter;
  filter = phoneNumber.length ? { ...filter, phone } : filter;
  return filter;
};

const sendVerficationRequest = (currentUser, OTP, intent, type) => {
  const options = {
    email: currentUser.email,
    phoneNumber: currentUser.phoneNumber,
    message: `please do not share with anyone! your one time OTP is : ${
      type === "EMAIL" ? OTP.email : OTP.phoneNumber
    }`,
    subject: intent,
  };
  type === "EMAIL" ? sendEmail(options) : sendSMS(options);
  return;
};
