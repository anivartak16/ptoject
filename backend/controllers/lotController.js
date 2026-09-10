import { Lot, Quality } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getLots(req, res, next) {
  try {
    const filter = { status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] } };
    if (req.query.mine === "true") filter.owner = req.user._id;
    if (req.query.commodity) filter.commodity = req.query.commodity;
    if (req.query.status) filter.status = req.query.status;

    const lots = await Lot.find(filter)
      .populate("owner quality")
      .sort({ createdAt: -1 });

    return ok(res, lots);
  } catch (error) {
    next(error);
  }
}

export async function createLot(req, res, next) {
  try {
    const body = req.body;
    if (!body.commodity || !(body.quantity > 0) || !(body.expectedPrice > 0)) {
      return fail(
        res,
        422,
        "Commodity, positive quantity and price are required",
      );
    }

    const quality = await Quality.create(body.quality || {});
    const lot = await Lot.create({
      ...body,
      owner: req.user._id,
      ownerType: req.user.role,
      remainingQuantity: body.quantity,
      quality: quality._id,
    });

    return ok(res, lot, "Lot created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateLot(req, res, next) {
  try {
    const lot = await Lot.findById(req.params.id);
    if (!lot) return fail(res, 404, "Lot not found", "NOT_FOUND");
    if (String(lot.owner) !== String(req.user._id)) {
      return fail(res, 403, "Only owner can update lot", "FORBIDDEN");
    }

    const editable = [
      "commodity",
      "quantity",
      "unit",
      "harvestDate",
      "location",
      "geo",
      "expectedPrice",
      "availableUntil",
    ];

    editable.forEach((key) => {
      if (req.body[key] !== undefined) lot[key] = req.body[key];
    });

    if (!(lot.quantity > 0) || !(lot.expectedPrice > 0)) {
      return fail(res, 422, "Quantity and price must be positive");
    }

    if (lot.remainingQuantity > lot.quantity) {
      lot.remainingQuantity = lot.quantity;
    }

    await lot.save();
    return ok(res, lot, "Lot updated");
  } catch (error) {
    next(error);
  }
}
