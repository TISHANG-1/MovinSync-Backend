import express from "express";
import { authorizedRoles, userAuth } from "../../../middlewares/auth.js";
import {
  submitFeedback,
  trackOngoinTrip,
} from "../../../controllers/user/travelerCampanion/base.js";
import { RESPONSE_CODES } from "../../../utils/helper.js";

const router = express();

router.post(
  "/submit-feedback",
  userAuth,
  authorizedRoles("travelerCompanion"),
  async (req, res) => {
    try {
      const { feedbackParams } = req.body;
      await submitFeedback(feedbackParams, req.user);
      res.status(RESPONSE_CODES.CREATED_CODE).send();
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

router.get(
  "/track-trip",
  userAuth,
  authorizedRoles("travelerCompanion"),
  async (req, res) => {
    try {
      const { tripId } = req.query;
      const tripInfo = await trackOngoinTrip(tripId, req.user);
      res.status(RESPONSE_CODES.SUCCESS_CODE).send(tripInfo);
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

export { router };
