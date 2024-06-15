import mongoose from "mongoose";

const statusEnum = ["ON-GOING", "COMPLETED"];
const tripSchema = new mongoose.Schema(
  {
    travelerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    driverDetails: {
      type: {
        name: {
          type: String,
        },
        phoneNumber: {
          type: String,
          validate: /^\+?[0-9]{0,3}[0-9]{10}$/,
        },
      },
    },
    vehicleId: {
      type: String,
      required: true,
    },
    startLocation: {
      type: {
        lat: {
          type: Number,
          default: 0,
        },
        lon: {
          type: Number,
          default: 0,
        },
      },
      default: {},
    },
    lastTrackedLocation: {
      type: {
        lat: {
          type: Number,
          default: 0,
        },
        lon: {
          type: Number,
          default: 0,
        },
      },
      default: {},
    },
    destinationLocation: {
      type: {
        lat: {
          type: Number,
          default: 0,
        },
        lon: {
          type: Number,
          default: 0,
        },
      },
      default: {},
    },
    travelerCompanionIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId }],
    },
    status: {
      type: String,
      enum: statusEnum,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model("Trip", tripSchema);
export default Trip;
