import mongoose from "mongoose";

const intentEnum = ["ONGOING-RIDE", "NEARBY-DESTINATION", "COMPLETED-RIDE"];
const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    intent: {
      type: String,
      enum: intentEnum,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
