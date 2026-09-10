import { Warehouse, StorageBooking } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getWarehouses(_req, res, next) {
  try {
    const warehouses = await Warehouse.find();
    return ok(res, warehouses);
  } catch (error) {
    next(error);
  }
}

export async function bookStorage(req, res, next) {
  try {
    const warehouse = await Warehouse.findById(req.body.warehouseId);
    if (
      !warehouse ||
      !(req.body.quantity > 0) ||
      req.body.quantity > warehouse.availableCapacity
    ) {
      return fail(
        res,
        409,
        "Storage capacity unavailable",
        "CAPACITY_UNAVAILABLE",
      );
    }

    const booking = await StorageBooking.create({
      warehouse: warehouse._id,
      user: req.user._id,
      quantity: req.body.quantity,
      days: req.body.days || 1,
      estimatedCost:
        req.body.quantity *
        (req.body.days || 1) *
        warehouse.pricePerUnitPerDay,
    });

    warehouse.availableCapacity -= req.body.quantity;
    await warehouse.save();

    return ok(res, booking, "Storage booked successfully");
  } catch (error) {
    next(error);
  }
}

export async function getStorageBookings(req, res, next) {
  try {
    const bookings = await StorageBooking.find({ user: req.user._id })
      .populate("warehouse")
      .sort({ createdAt: -1 });

    return ok(res, bookings);
  } catch (error) {
    next(error);
  }
}
