import express from "express";
import { userAuth, authorizedRoles } from "../../../middlewares/auth.js";
import { RESPONSE_CODES } from "../../../utils/helper.js";
import {
  shareTrip,
  createTrip,
  updateTrip,
  getSharedTripsDetails,
  endTrip,
} from "../../../controllers/user/traveler/base.js";
const router = express();

router.post(
  "/create-trip",
  userAuth,
  authorizedRoles("traveler"),
  async (req, res) => {
    try {
      const { tripParams } = req.body;
      const trip = await createTrip(tripParams, req.user);
      res.status(RESPONSE_CODES.CREATED_CODE).send(trip);
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

router.post(
  "/share-trip",
  userAuth,
  authorizedRoles("traveler"),
  async (req, res) => {
    try {
      const { tripId, travelerCompanions } = req.body;
      await shareTrip(travelerCompanions, tripId, req.user);
      res.status(RESPONSE_CODES.SUCCESS_CODE).send();
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

router.post(
  "/update-trip",
  userAuth,
  authorizedRoles("traveler"),
  async (req, res) => {
    try {
      const { currentLocation, tripId } = req.body;
      await updateTrip(currentLocation, tripId, req.user);
      res.status(RESPONSE_CODES.SUCCESS_CODE).send();
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

router.post(
  "/end-trip",
  userAuth,
  authorizedRoles("traveler"),
  async (req, res) => {
    try {
      const { tripId } = req.body;
      console.log("here");
      await endTrip(tripId, req.user);
      res.status(RESPONSE_CODES.SUCCESS_CODE).send();
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
  authorizedRoles("traveler"),
  async (req, res) => {
    try {
      const sharedTrips = await getSharedTripsDetails(req.user);
      res.status(RESPONSE_CODES.SUCCESS_CODE).send(sharedTrips);
    } catch (err) {
      console.log(err);
      const { status = 500, message = "Internal Server Error" } = err;
      res.status(status).send(message);
    }
  }
);

export { router };
