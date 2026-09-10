import { User, Lot } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function getFpoFarmers(req, res, next) {
  try {
    const search = (req.query.search || "").trim();
    const filter = {
      role: "FARMER",
      active: true,
      ...(search
        ? {
            $or: [
              { name: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
              { location: new RegExp(search, "i") },
            ],
          }
        : {}),
    };

    const farmers = await User.find(filter)
      .select("-password")
      .sort({ name: 1 })
      .limit(30);

    return ok(res, farmers);
  } catch (error) {
    next(error);
  }
}

export async function getFpoMembers(req, res, next) {
  try {
    const fpo = await User.findById(req.user._id).populate({
      path: "members",
      select: "name email phone location farmName primaryCrop verification",
    });

    return ok(res, fpo?.members || []);
  } catch (error) {
    next(error);
  }
}

export async function addFpoMember(req, res, next) {
  try {
    const farmer = await User.findOne({
      _id: req.body.farmerId,
      role: "FARMER",
      active: true,
    });

    if (!farmer) return fail(res, 404, "Farmer not found", "NOT_FOUND");

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { members: farmer._id },
    });

    return ok(res, farmer, "Farmer added to FPO");
  } catch (error) {
    next(error);
  }
}

export async function removeFpoMember(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { members: req.params.farmerId },
    });

    return ok(res, {}, "Farmer removed from FPO");
  } catch (error) {
    next(error);
  }
}

export async function getFpoLots(req, res, next) {
  try {
    const fpo = await User.findById(req.user._id).select("members");
    const lots = await Lot.find({
      owner: { $in: [...(fpo?.members || []), req.user._id] },
      status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
    })
      .populate("owner quality")
      .sort({ createdAt: -1 });

    return ok(res, lots);
  } catch (error) {
    next(error);
  }
}

export async function aggregateLots(req, res, next) {
  try {
    const ids = req.body.lotIds || [];
    const fpo = await User.findById(req.user._id).select("members location");
    const source = await Lot.find({
      _id: { $in: ids },
      owner: { $in: fpo?.members || [] },
      status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
    });

    if (!source.length) {
      return fail(res, 422, "Select at least one available lot");
    }

    const commodity = source[0].commodity;
    if (source.some((x) => x.commodity !== commodity)) {
      return fail(res, 422, "Only one commodity can be aggregated at a time");
    }

    const quantity = source.reduce((a, x) => a + x.remainingQuantity, 0);
    const lot = await Lot.create({
      owner: req.user._id,
      ownerType: "FPO",
      sourceLots: source.map((x) => x._id),
      commodity,
      quantity,
      remainingQuantity: quantity,
      unit: source[0].unit,
      location: req.user.location,
      expectedPrice:
        req.body.expectedPrice ||
        source.reduce((a, x) => a + x.expectedPrice, 0) / source.length,
      quality: source[0].quality,
      availableUntil:
        req.body.availableUntil || new Date(Date.now() + 14 * 86400000),
    });

    await Lot.updateMany(
      { _id: { $in: source.map((x) => x._id) } },
      { status: "CANCELLED" },
    );

    return ok(res, lot, "FPO aggregated lot created");
  } catch (error) {
    next(error);
  }
}
