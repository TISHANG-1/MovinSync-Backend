import Trip from "../../models/trip.js";
import Feedback from "../../models/feedback.js";
import User from "../../models/User.js";

export const fetchAllSharedTrip = async () => {
  const sharedTrips = await Trip.find({
    travelerCompanionIds: { $exists: true, $ne: [] },
  });

  let userIdToName = {};
  let sharedRides = [];

  for (const trip of sharedTrips) {
    const {
      travelerId,
      travelerCompanionIds,
      startLocation,
      destinationLocation,
      lastUpdatedLocation,
    } = trip;

    if (!userIdToName[travelerId]) {
      const user = await User.findById(travelerId);
      userIdToName[travelerId] = user.name;
    }

    let travelerCompanions = [];
    for (const travelerCompanionId of travelerCompanionIds) {
      if (!userIdToName[travelerCompanionId]) {
        const user = await User.findById(travelerCompanionId);
        userIdToName[travelerCompanionId] = user.name;
      }
      travelerCompanions.push(userIdToName[travelerCompanionId]);
    }

    sharedRides.push({
      travelerName: userIdToName[travelerId],
      travelerCompanions,
      startLocation,
      destinationLocation,
      lastUpdatedLocation,
    });
  }

  return { sharedRides };
};

export const fetchAllFeedbacks = async () => {
  const feedbacks = await Feedback.find({});

  let userIdToName = {};
  let tripIdToTripDetails = {};
  let allFeedbacks = [];

  for (const feedback of feedbacks) {
    const { userId, rating, description, tripId } = feedback;

    if (!userIdToName[userId]) {
      const user = await User.findById(userId);
      userIdToName[userId] = user.name;
    }

    if (!tripIdToTripDetails[tripId]) {
      const trip = await Trip.findById(tripId);
      tripIdToTripDetails[tripId] = {
        startLocation: trip.startLocation,
        destinationLocation: trip.destinationLocation,
      };
    }

    allFeedbacks.push({
      userName: userIdToName[userId],
      rating,
      description,
      tripDetails: tripIdToTripDetails[tripId],
    });
  }

  return { allFeedbacks };
};
