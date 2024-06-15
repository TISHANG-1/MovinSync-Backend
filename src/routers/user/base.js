import express from "express";
import { RESPONSE_CODES } from "../../utils/helper.js";
import { userAuth } from "../../middlewares/auth.js";
import {
  loginUser,
  createUser,
  deleteUser,
  generateVerifyUserRequest,
  verifyUserRequest,
  updateUser,
} from "../../controllers/user/base.js";
const router = express();

import { router as travelerRouter } from "./traveler/base.js";
import { router as travelerCompanionRouter } from "./travelerCampanion/base.js";

router.post("/login", async (req, res) => {
  try {
    const { loginParams } = req.body;
    const user = await loginUser(loginParams);
    res.status(RESPONSE_CODES.SUCCESS_CODE).send(user);
  } catch (err) {
    console.log(err);
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).send(message);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { userParams } = req.body;
    const user = await createUser(userParams);
    console.log(user);
    res.status(RESPONSE_CODES.CREATED_CODE).send(user);
  } catch (err) {
    console.log(err);
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).send(message);
  }
});

router.post("/verification-request", userAuth, async (req, res) => {
  try {
    const { type } = req.body;
    await generateVerifyUserRequest(req.user, type);
    res.status(RESPONSE_CODES.SUCCESS_CODE).send();
  } catch (err) {
    console.log(err);
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).send(message);
  }
});

router.post("/verify", userAuth, async (req, res) => {
  try {
    const { code = "xxxxxx", type = "" } = req.body;
    await verifyUserRequest(req.user, code, type);
    res
      .status(RESPONSE_CODES.SUCCESS_CODE)
      .send({ message: "successfully verified" });
  } catch (err) {
    console.log(err);
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).send(message);
  }
});

router.post("/update", userAuth, async (req, res) => {
  try {
    const { userParams } = req.body;
    await updateUser(req.user, userParams);
    res.status(RESPONSE_CODES.SUCCESS_CODE).send({ message: "successful" });
  } catch (err) {
    console.log(err);
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).send(message);
  }
});

// router.post("/reset-password-request", async (req, res) => {
//   try {
//     const { email = "", phoneNumber = "" } = req.body;
//     await resetPasswordRequest(email, phoneNumber);
//     res
//       .send(RESPONSE_CODES.CREATED_CODE)
//       .send({ message: "Reset Password Request Created Successfully" });
//   } catch {
//     (err) => {
//       console.log(err);
//       const { status = 500, message = "Internal Server Error" } = err;
//       res.status(status).send(message);
//     };
//   }
// });

// router.post("/reset-password", async (req, res) => {
//   try {
//     const { email } = req.body;
//     await resetPassword(email);
//     res
//       .send(RESPONSE_CODES.CREATED_CODE)
//       .send({ message: "Reset Password Request Created Successfully" });
//   } catch {
//     (err) => {
//       console.log(err);
//       const { status = 500, message = "Internal Server Error" } = err;
//       res.status(status).send(message);
//     };
//   }
// });

router.delete("/delete", userAuth, async (req, res) => {
  try {
    await deleteUser(req.user);
    res.status(RESPONSE_CODES.SUCCESS_CODE).send();
  } catch (err) {
    console.log(err);
    const { status = 500, message = "Internal Server Error" } = err;
    res.status(status).send(message);
  }
});

router.use("/traveler", travelerRouter);
router.use("/traveler-companion", travelerCompanionRouter);

export { router };
