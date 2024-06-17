import { setDataInRedisCache } from "../../../../config/database/redis.js";
import Trip from "../../../models/trip.js";
import geolib from "geolib";
import { sendSMS } from "../../../utils/sendSMS.js";
import Notification from "../../../models/notification.js";
import User from "../../../models/User.js";
import { RESPONSE_CODES, generateError } from "../../../utils/helper.js";
const ROOT_URL = "http://localhost:3000";
export const createTrip = async (tripParams, currentUser) => {
  const {
    driverName,
    driverPhoneNumber,
    vehicleNumber,
    startLat,
    startLon,
    endLat,
    endLon,
  } = tripParams;
  const trip = await Trip.create({
    travelerId: currentUser._id,
    driverDetails: {
      name: driverName,
      phoneNumber: driverPhoneNumber,
    },
    vehicleId: vehicleNumber,
    startLocation: {
      lat: startLat,
      lon: startLon,
    },
    lastUpdatedLocation: {
      lat: startLat,
      lon: startLon,
    },
    destinationLocation: {
      lat: endLat,
      lon: endLon,
    },
    status: "ON-GOING",
  });
  await setDataInRedisCache("trip", trip, 10);
  return { tripId: trip._id };
};

export const updateTrip = async (currentLocation, tripId, currentUser) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "Trip not found");
  }
  trip.lastTrackedLocation = currentLocation;
  const destinationLocation = trip.destinationLocation;
  await trip.save();
  const isDestinationNearBy = geolib.isPointWithinRadius(
    { latitude: currentLocation.lat, longitude: currentLocation.lon },
    { latitude: destinationLocation.lat, longitude: destinationLocation.lon },
    200
  );
  if (isDestinationNearBy) {
    const options = {
      message: `${currentUser.name} is near ${destinationLocation.lat} and ${destinationLocation.lon}
       view live status on ${ROOT_URL}/view-trip/${tripId}`,
    };
    const { travelerCompanionIds } = trip;
    for (const travelerCompanionId of travelerCompanionIds) {
      const user = await User.findOne({ _id: travelerCompanionId });
      if (user) {
        sendSMS({ ...options, phoneNumber: user.phoneNumber });
        await Notification.create({
          from: currentUser._id,
          to: travelerCompanionId,
          intent: "NEARBY-DESTINATION",
          data: options.message,
          tripId: tripId,
        });
      }
    }
  }
  await setDataInRedisCache("trip", trip, 10);
};

export const shareTrip = async (travelerCompanionList, tripId, currentUser) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "Trip not found");
  }
  for (const travelerCompanion of travelerCompanionList) {
    const filter = getFilter(travelerCompanion);
    const { destinationLocation } = trip;
    const user = await User.findOne(filter);
    const options = {
      message: `${currentUser.name} is near ${destinationLocation.lat} and ${destinationLocation.lon}
        view live status on ${ROOT_URL}/view-trip/${tripId}
      `,
    };
    if (user) {
      trip.travelerCompanionIds.push(user._id);
      await trip.save();
      sendSMS({ ...options, phoneNumber: user.phoneNumber });
      await Notification.create({
        from: currentUser._id,
        to: user._id,
        intent: "ONGOING-RIDE",
        data: options.message,
        tripId: tripId,
      });
    }
  }
};

export const endTrip = async (tripId, currentUser) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw generateError(RESPONSE_CODES.BAD_REQUEST_CODE, "Trip not found");
  }
  trip.status = "COMPLETED";
  await trip.save();
  const { lastTrackedLocation } = trip;
  const options = {
    message: `${currentUser.name} has ended trip nearby ${lastTrackedLocation.lat} and ${lastTrackedLocation.lon}
     view live status on ${ROOT_URL}/view-trip/${tripId}
    `,
  };
  const { travelerCompanionIds } = trip;
  for (const travelerCompanionId of travelerCompanionIds) {
    const user = await User.findOne({ _id: travelerCompanionId });
    sendSMS({ ...options, phoneNumber: user.phoneNumber });
    await Notification.create({
      from: currentUser._id,
      to: travelerCompanionId,
      intent: "COMPLETED-RIDE",
      data: options.message,
      tripId: tripId,
    });
  }
  await setDataInRedisCache("trip", trip, 10);
  return;
};

export const getSharedTripsDetails = async (currentUser) => {
  const trips = await Trip.find({
    travelerId: currentUser._id,
    travelerCompanionIds: { $exists: true, $ne: [] },
  });
  const sharedTripList = [];
  let index = 0;
  for (const trip of trips) {
    sharedTripList.push({
      key: trip._id,
      index: index + 1,
      driverName: trip.driverDetails.name,
      vechileNumber: trip.driverDetails.vechileNumber,
      startLocation: trip.startLocation,
      destinationLocation: trip.destinationLocation,
      travelerCompanions: trip.travelerCompanionIds,
      status: trip.status,
    });
  }
  return { sharedTripList };
};

// helper functions not to be exported

const getFilter = (travelerCompanion) => {
  const {
    phoneNumber = "",
    email = "",
    travelerCompanionId = "",
  } = travelerCompanion;
  let filter = {};
  filter = phoneNumber.length ? { ...filter, phoneNumber } : filter;
  filter = email.length ? { ...filter, email } : filter;
  filter = travelerCompanionId.length
    ? { ...filter, travelerCompanionId }
    : filter;
  return filter;
};
