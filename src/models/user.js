import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RESPONSE_CODES, generateError } from "../utils/helper.js";
// import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter name"],
    maxLength: [30, "Maximum Limit exceeded"],
    minLength: [3, "Name should have atleast 3 characters"],
  },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please eneter the Password"],
    minLength: [8, "Password Should be greater than 8 character"],
    select: false,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter a valid phone number"],
    unique: true,
    validate: /^\+?[0-9]{0,3}[0-9]{10}$/,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isTraveler: {
    type: Boolean,
    default: false,
  },
  isTravelerCompanion: {
    type: Boolean,
    default: false,
  },
  notification: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  verificationCode: {
    type: {
      email: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
    },
    default: {},
  },
  verificationExpiryDate: {
    type: {
      email: {
        type: Date,
      },
      phoneNumber: {
        type: Date,
      },
    },
    default: {},
  },
  isVerified: {
    type: {
      email: {
        type: Boolean,
        default: false,
      },
      phoneNumber: {
        type: Boolean,
        default: false,
      },
    },
    default: {},
  },
  resetPassword: {
    type: String,
  },
  resetPasswordExpiryDate: {
    type: Date,
  },
});

// pre-processing before saving the password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});
// JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
// comparing the password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// generating reset password token
// userSchema.methods.getResetPasswordToken = function () {
//   //Generating Token
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   console.log(resetToken);
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");
//   console.log(this.resetPasswordToken);
//   //
//   this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
// };

userSchema.methods.generateVerificationOTP = function (type) {
  //Generating Token

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const verificationExpiryDate = Date.now() + 15 * 60 * 1000;
  if (!this.verificationCode) {
    this.verificationCode = {};
    this.verificationExpiryDate = {};
  }
  if (type === "EMAIL") {
    this.verificationCode = {
      ...this.verificationCode,
      email: verificationCode,
    };
    this.verificationExpiryDate = {
      ...this.verificationExpiryDate,
      email: verificationExpiryDate,
    };
  } else if (type === "PHONE") {
    this.verificationCode = {
      ...this.verificationCode,
      phoneNumber: verificationCode,
    };
    this.verificationExpiryDate = {
      ...this.verificationExpiryDate,
      phoneNumber: verificationExpiryDate,
    };
  } else {
    throw generateError(
      RESPONSE_CODES.BAD_REQUEST_CODE,
      "INVAILABLE_REQUEST_TYPE"
    );
  }
  return this.verificationCode;
};

const User = mongoose.model("User", userSchema);
export default User;
