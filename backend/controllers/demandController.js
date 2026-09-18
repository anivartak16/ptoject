import { Demand } from "../models/index.js";
import { matchesFor } from "../services/intelligence.js";
import { ok, fail } from "../utils/response.js";

export async function getDemands(req, res, next) {
  try {
    const filter =
      req.query.mine === "true"
        ? { buyer: req.user._id }
        : { status: "ACTIVE" };

    const demands = await Demand.find(filter)
      .populate({
        path: "buyer",
        select:
          "name email phone organizationName location district state verification verificationBadge gstNumber panNumber buyerType tradeRating",
      })
      .sort({ createdAt: -1 });

    return ok(res, demands);
  } catch (error) {
    next(error);
  }
}

export async function createDemand(req, res, next) {
  try {
    const body = req.body;
    if (
      !body.commodity ||
      !(body.requiredQuantity > 0) ||
      !(body.maxPrice > 0)
    ) {
      return fail(res, 422, "Commodity, quantity and max price are required");
    }

    const demand = await Demand.create({
      ...body,
      buyer: req.user._id,
    });

    const populatedDemand = await Demand.findById(demand._id).populate({
      path: "buyer",
      select:
        "name email phone organizationName location district state verification verificationBadge gstNumber panNumber buyerType tradeRating",
    });

    return ok(res, populatedDemand, "Demand created successfully");
  } catch (error) {
    next(error);
  }
}

export async function getMatchesForDemand(req, res, next) {
  try {
    const demand = await Demand.findById(req.params.demandId).populate({
      path: "buyer",
      select:
        "name email phone organizationName location district state verification verificationBadge gstNumber panNumber buyerType tradeRating",
    });
    if (!demand) return fail(res, 404, "Demand not found", "NOT_FOUND");

    // All authenticated roles (BUYER, FPO, FARMER, ADMIN) can view ranked matches
    const matches = await matchesFor(demand, req.user);
    return ok(res, { demand, matches }, "Explainable matches");
  } catch (error) {
    next(error);
  }
}
