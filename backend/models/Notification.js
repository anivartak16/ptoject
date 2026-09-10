import mongoose from "mongoose";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    message: String,
    type: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification =
  mongoose.models.Notification || model("Notification", notificationSchema);
export default Notification;
