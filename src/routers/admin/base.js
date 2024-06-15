import express from "express";
import { authorizedRoles, userAuth } from "../../middlewares/auth.js";
import {
  fetchAllFeedbacks,
  fetchAllSharedTrip,
} from "../../controllers/admin/base.js";
import { RESPONSE_CODES } from "../../utils/helper.js";

const router = express();

router.get(
  "/list-feedbacks",
  userAuth,
  authorizedRoles("admin"),
  async (req, res) => {
    try {
      const feedbacks = await fetchAllFeedbacks();
      res.status(RESPONSE_CODES.SUCCESS_CODE).send(feedbacks);
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

router.get(
  "/list-shared-trips",
  userAuth,
  authorizedRoles("admin"),
  async (req, res) => {
    try {
      const sharedTrips = await fetchAllSharedTrip();
      res.status(RESPONSE_CODES.SUCCESS_CODE).send(sharedTrips);
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

export { router };
