import Trip from "../../models/trip.js";
import Feedback from "../../models/feedback.js";
import User from "../../models/User.js";

export const fetchAllSharedTrip = async () => {
  const sharedTrips = await Trip.find({
    travelerCompanionIds: { $exists: true, $ne: [] },
  });

  let userIdToNameMap = {};
  let userIdToEmailMap = {};
  let sharedRides = [];
  let index = 0;
  for (const trip of sharedTrips) {
    const {
      travelerId,
      travelerCompanionIds,
      startLocation,
      destinationLocation,
      lastTrackedLocation,
    } = trip;

    if (!userIdToNameMap[travelerId]) {
      const user = await User.findById(travelerId);
      userIdToNameMap[travelerId] = user.name;
      userIdToEmailMap[travelerId] = user.email;
    }

    let travelerCompanions = [];
    for (const travelerCompanionId of travelerCompanionIds) {
      if (!userIdToNameMap[travelerCompanionId]) {
        const user = await User.findById(travelerCompanionId);
        userIdToNameMap[travelerCompanionId] = user.name;
        userIdToEmailMap[travelerCompanionId] = user.email;
      }
      travelerCompanions.push(userIdToEmailMap[travelerCompanionId]);
    }

    sharedRides.push({
      index: ++index,
      name: userIdToNameMap[travelerId],
      email: userIdToEmailMap[travelerId],
      travelerCompanions,
      startLocation,
      destinationLocation,
      lastTrackedLocation,
    });
  }

  return { sharedRides };
};

export const fetchAllFeedbacks = async () => {
  const feedbacks = await Feedback.find({});

  let userIdToEmailMap = {};
  let tripIdToTripDetails = {};
  let allFeedbacks = [];
  let index = 0;
  for (const feedback of feedbacks) {
    const { userId, rating, description, tripId } = feedback;

    if (!userIdToEmailMap[userId]) {
      const user = await User.findById(userId);
      userIdToEmailMap[userId] = user.email;
    }

    if (!tripIdToTripDetails[tripId]) {
      const trip = await Trip.findById(tripId);
      tripIdToTripDetails[tripId] = {
        startLocation: trip.startLocation,
        destinationLocation: trip.destinationLocation,
      };
    }
    allFeedbacks.push({
      index: index + 1,
      email: userIdToEmailMap[userId],
      rating,
      description,
      ...tripIdToTripDetails[tripId],
      tripId,
    });
    index += 1;
  }

  return { allFeedbacks };
};
