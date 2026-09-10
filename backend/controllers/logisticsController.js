import { LogisticsProvider, LogisticsBooking } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getLogisticsProviders(_req, res, next) {
  try {
    const providers = await LogisticsProvider.find({ availability: true });
    return ok(res, providers);
  } catch (error) {
    next(error);
  }
}

export async function bookLogistics(req, res, next) {
  try {
    const provider = await LogisticsProvider.findById(req.body.providerId);
    if (!provider) return fail(res, 404, "Provider not found");

    const booking = await LogisticsBooking.create({
      ...req.body,
      requestedBy: req.user._id,
      provider: provider._id,
      estimatedCost:
        req.body.estimatedCost ||
        provider.pricePerKm * (req.body.distanceKm || 0),
    });

    return ok(res, booking, "Logistics booking created");
  } catch (error) {
    next(error);
  }
}

export async function getLogisticsBookings(req, res, next) {
  try {
    const filter =
      req.user.role === "ADMIN" ? {} : { requestedBy: req.user._id };

    const bookings = await LogisticsBooking.find(filter)
      .populate("provider transaction")
      .sort({ createdAt: -1 });

    return ok(res, bookings);
  } catch (error) {
    next(error);
  }
}
