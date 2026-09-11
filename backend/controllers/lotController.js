import { Lot, Quality } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getLots(req, res, next) {
  try {
    const filter = {};
    if (req.query.mine === "true") {
      filter.owner = req.user._id;
      if (req.query.status) filter.status = req.query.status;
    } else {
      // Marketplace browsing: only published, available lots
      filter.status = req.query.status || { $in: ["AVAILABLE", "PARTIALLY_SOLD"] };
    }
    if (req.query.commodity) filter.commodity = req.query.commodity;

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

    const quality = await Quality.create({
      grade: body.quality?.grade || "Pending Inspection",
      moisture: body.quality?.moisture,
      inspectionStatus: "PENDING",
      inspectionNotes: "Submitted for Krishi Vigyan Kendra testing",
    });

    const lot = await Lot.create({
      ...body,
      owner: req.user._id,
      ownerType: req.user.role,
      remainingQuantity: body.quantity,
      quality: quality._id,
      status: "PENDING_VERIFICATION", // Must be verified by KVK before listing
    });

    const populated = await Lot.findById(lot._id).populate("owner quality");
    return ok(
      res,
      populated,
      "Lot registered and submitted to Krishi Vigyan Kendra for verification",
    );
  } catch (error) {
    next(error);
  }
}

export async function publishLot(req, res, next) {
  try {
    const lot = await Lot.findById(req.params.id).populate("quality");
    if (!lot) return fail(res, 404, "Lot not found", "NOT_FOUND");
    if (String(lot.owner) !== String(req.user._id)) {
      return fail(
        res,
        403,
        "Only the owner can list this lot on the marketplace",
        "FORBIDDEN",
      );
    }

    if (lot.status !== "VERIFIED") {
      return fail(
        res,
        400,
        "This lot cannot be listed yet. Produce must be verified and certified by Krishi Vigyan Kendra first.",
        "NOT_VERIFIED",
      );
    }

    lot.status = "AVAILABLE";
    await lot.save();

    const populated = await Lot.findById(lot._id).populate("owner quality");
    return ok(
      res,
      populated,
      "Lot successfully listed on the marketplace for selling!",
    );
  } catch (error) {
    next(error);
  }
}

export async function sendForVerification(req, res, next) {
  try {
    const lot = await Lot.findById(req.params.id).populate("quality");
    if (!lot) return fail(res, 404, "Lot not found", "NOT_FOUND");
    if (String(lot.owner) !== String(req.user._id)) {
      return fail(
        res,
        403,
        "Only the owner can request verification for this lot",
        "FORBIDDEN",
      );
    }

    lot.status = "PENDING_VERIFICATION";
    if (lot.quality) {
      await Quality.findByIdAndUpdate(lot.quality._id, {
        inspectionStatus: "PENDING",
        inspectionNotes: req.body.notes || "Submitted for quality testing",
      });
    } else {
      const quality = await Quality.create({
        grade: "Pending Inspection",
        inspectionStatus: "PENDING",
        inspectionNotes: req.body.notes || "Submitted for quality testing",
      });
      lot.quality = quality._id;
    }
    await lot.save();

    const populated = await Lot.findById(lot._id).populate("owner quality");
    return ok(
      res,
      populated,
      "Lot submitted to Krishi Vigyan Kendra for quality testing",
    );
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
