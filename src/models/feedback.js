import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
