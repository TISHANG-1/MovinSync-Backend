import { RESPONSE_CODES, generateError } from "../../../utils/helper.js";
import Feedback from "../../../models/feedback.js";
import Trip from "../../../models/trip.js";
import {
  getDataFromRedisCache,
  setDataInRedisCache,
} from "../../../../config/database/redis.js";

export const submitFeedback = async (feedbackParams, curretUser) => {
  const { tripId, rating, description } = feedbackParams;
  const feedback = await Feedback.findOne({ userId: curretUser._id, tripId });
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw generateError(
      RESPONSE_CODES.FORBIDDEN_ERROR_CODE,
      "Trip doesnt exists"
    );
  }
  if (!feedback) {
    await Feedback.create({
      tripId,
      rating,
      description,
      userId: curretUser._id,
    });
  } else {
    throw generateError(
      RESPONSE_CODES.FORBIDDEN_ERROR_CODE,
      "Feedback already exists"
    );
  }
  return;
};

export const trackOngoinTrip = async (tripId, currentUser) => {
  const cacheKey = `trip-${tripId}`;
  const cachedTrip = await getDataFromRedisCache(cacheKey);
  if (cachedTrip !== null) {
    await setDataInRedisCache("trip", JSON.parse(cachedTrip), 10);

    const tripInfo = JSON.parse(cachedTrip);
    const authorized = tripInfo.travelerCompanionIds.includes(currentUser._id);
    if (!authorized) {
      return { tripInfo: { status: "Not Authorized" } };
    }
    if (tripInfo.status === "COMPLETED") {
      return { tripInfo: { status: "COMPLETED" } };
    }
    return { tripInfo };
  }
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "Trip doesnt exists");
  }
  setDataInRedisCache("trip", trip, 10);
  const tripInfo = trip;
  const authorized = tripInfo.travelerCompanionIds.includes(currentUser._id);
  if (!authorized) {
    return { tripInfo: { status: "NOT Authorized" } };
  }
  if (trip.status === "COMPLETED") {
    return { tripInfo: { status: "COMPLETED" } };
  }
  return { tripInfo };
};
