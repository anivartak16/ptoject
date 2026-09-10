import { Notification } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return ok(res, notifications);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const row = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true },
    );

    if (!row) return fail(res, 404, "Notification not found");
    return ok(res, row, "Notification marked as read");
  } catch (error) {
    next(error);
  }
}
