import { Dispute } from "./models/index.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { requireAuth, requireRole } from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import inspectionRoutes from "./routes/inspectionRoutes.js";
import {
  User,
  Lot,
  Quality,
  Demand,
  Market,
  MarketPrice,
  Offer,
  Transaction,
  Payment,
  Notification,
  Warehouse,
  LogisticsProvider,
  LogisticsBooking,
  StorageBooking,
} from "./models/index.js";
import {
  priceInsight,
  marketsFor,
  sellAdvice,
  matchesFor,
} from "./services/intelligence.js";
import { acceptOffer } from "./services/transaction.js";
const app = express();
app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        origin === process.env.CLIENT_URL ||
        /^http:\/\/localhost:517\d$/.test(origin)
      )
        return cb(null, true);
      cb(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });
const fail = (res, status, message, error = "VALIDATION_ERROR") =>
  res.status(status).json({ success: false, message, error });
app.get("/api/health", (q, s) => ok(s, { status: "healthy" }));
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inspections", inspectionRoutes);
app.get("/api/markets", async (q, s, n) => {
  try {
    ok(s, await Market.find(q.query.state ? { state: q.query.state } : {}));
  } catch (e) {
    n(e);
  }
});
app.get("/api/markets/nearby", requireAuth, async (q, s, n) => {
  try {
    let origin;
    const longitude = Number(q.query.longitude),
      latitude = Number(q.query.latitude);
    if (Number.isFinite(longitude) && Number.isFinite(latitude))
      origin = [longitude, latitude];
    else if (q.user?.geo?.coordinates?.length === 2)
      origin = q.user.geo.coordinates;
    else if (q.user?.location) {
      const market = await Market.findOne({
        location: new RegExp(`^${q.user.location}$`, "i"),
      });
      if (market?.geo?.coordinates?.length === 2)
        origin = market.geo.coordinates;
    }
    const rows = await marketsFor(q.query.commodity || "Wheat", origin);
    ok(s, rows, "Nearest grain mandis");
  } catch (e) {
    n(e);
  }
});
app.get("/api/prices", async (q, s, n) => {
  try {
    let f = {};
    if (q.query.commodity) f.commodity = q.query.commodity;
    const rows = await MarketPrice.find(f)
      .populate("market")
      .sort({ date: -1 })
      .limit(100);
    ok(s, rows);
  } catch (e) {
    n(e);
  }
});
app.get("/api/prices/trends", async (q, s, n) => {
  try {
    const insight = await priceInsight(q.query.commodity || "Wheat");
    if (!insight) return fail(s, 404, "No prices found", "NOT_FOUND");
    const demands = await Demand.countDocuments({
      commodity: q.query.commodity || "Wheat",
      status: "ACTIVE",
    });
    ok(s, { ...insight, advice: sellAdvice(insight, demands) });
  } catch (e) {
    n(e);
  }
});
app.get("/api/lots", requireAuth, async (q, s, n) => {
  try {
    let f = { status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] } };
    if (q.query.mine === "true") f.owner = q.user._id;
    if (q.query.commodity) f.commodity = q.query.commodity;
    if (q.query.status) f.status = q.query.status;
    ok(s, await Lot.find(f).populate("owner quality").sort({ createdAt: -1 }));
  } catch (e) {
    n(e);
  }
});
app.post(
  "/api/lots",
  requireAuth,
  requireRole("FARMER", "FPO"),
  async (q, s, n) => {
    try {
      const b = q.body;
      if (!b.commodity || !(b.quantity > 0) || !(b.expectedPrice > 0))
        return fail(
          s,
          422,
          "Commodity, positive quantity and price are required",
        );
      const quality = await Quality.create(b.quality || {});
      const lot = await Lot.create({
        ...b,
        owner: q.user._id,
        ownerType: q.user.role,
        remainingQuantity: b.quantity,
        quality: quality._id,
      });
      ok(s, lot, "Lot created successfully");
    } catch (e) {
      n(e);
    }
  },
);
app.put("/api/lots/:id", requireAuth, async (q, s, n) => {
  try {
    const lot = await Lot.findById(q.params.id);
    if (!lot) return fail(s, 404, "Lot not found", "NOT_FOUND");
    if (String(lot.owner) !== String(q.user._id))
      return fail(s, 403, "Only owner can update lot", "FORBIDDEN");
    const editable = ["commodity", "quantity", "unit", "harvestDate", "location", "geo", "expectedPrice", "availableUntil"];
    editable.forEach((key) => {
      if (q.body[key] !== undefined) lot[key] = q.body[key];
    });
    if (!(lot.quantity > 0) || !(lot.expectedPrice > 0)) return fail(s, 422, "Quantity and price must be positive");
    if (lot.remainingQuantity > lot.quantity) lot.remainingQuantity = lot.quantity;
    await lot.save();
    ok(s, lot, "Lot updated");
  } catch (e) {
    n(e);
  }
});
app.get("/api/demands", requireAuth, async (q, s, n) => {
  try {
    const f = q.query.mine === "true" ? { buyer: q.user._id } : { status: "ACTIVE" };
    ok(s, await Demand.find(f).populate("buyer").sort({ createdAt: -1 }));
  } catch (e) {
    n(e);
  }
});
app.post("/api/demands", requireAuth, requireRole("BUYER"), async (q, s, n) => {
  try {
    const b = q.body;
    if (!b.commodity || !(b.requiredQuantity > 0) || !(b.maxPrice > 0))
      return fail(s, 422, "Commodity, quantity and max price are required");
    ok(
      s,
      await Demand.create({ ...b, buyer: q.user._id }),
      "Demand created successfully",
    );
  } catch (e) {
    n(e);
  }
});
app.get("/api/matches/:demandId", requireAuth, async (q, s, n) => {
  try {
    const d = await Demand.findById(q.params.demandId);
    if (!d) return fail(s, 404, "Demand not found", "NOT_FOUND");
    if (String(d.buyer) !== String(q.user._id) && q.user.role !== "ADMIN")
      return fail(s, 403, "Not your demand", "FORBIDDEN");
    ok(s, await matchesFor(d), "Explainable matches");
  } catch (e) {
    n(e);
  }
});
app.get("/api/offers", requireAuth, async (q, s, n) => {
  try {
    const offers = await Offer.find()
      .populate({ path: "lot", populate: ["owner", "quality"] })
      .populate("buyer")
      .sort({ createdAt: -1 });
    const visible = offers.filter(
      (o) =>
        q.user.role === "ADMIN" ||
        String(o.buyer._id) === String(q.user._id) ||
        String(o.lot.owner._id) === String(q.user._id),
    );
    ok(s, visible);
  } catch (e) {
    n(e);
  }
});
app.post("/api/offers", requireAuth, requireRole("BUYER"), async (q, s, n) => {
  try {
    const { lotId, quantity, pricePerUnit, message, validUntil } = q.body;
    const lot = await Lot.findById(lotId);
    if (!lot || lot.status === "SOLD")
      return fail(s, 404, "Available lot not found", "NOT_FOUND");
    if (quantity > lot.remainingQuantity)
      return fail(s, 409, "Offer exceeds remaining quantity", "OVERSALE");
    const offer = await Offer.create({
      lot: lotId,
      buyer: q.user._id,
      quantity,
      pricePerUnit,
      totalAmount: quantity * pricePerUnit,
      message,
      validUntil,
    });
    await Notification.create({
      user: lot.owner,
      message: `New offer for ${lot.commodity}: ₹${pricePerUnit}/kg`,
      type: "NEW_OFFER",
    });
    ok(s, offer, "Offer created successfully");
  } catch (e) {
    n(e);
  }
});
app.patch("/api/offers/:id/accept", requireAuth, async (q, s, n) => {
  try {
    ok(
      s,
      await acceptOffer(q.params.id, q.user),
      "Offer accepted and transaction created",
    );
  } catch (e) {
    fail(
      s,
      e.message.includes("quantity") ? 409 : 403,
      e.message,
      "OFFER_ACCEPT_FAILED",
    );
  }
});
app.patch("/api/offers/:id/reject", requireAuth, async (q, s, n) => {
  try {
    const o = await Offer.findById(q.params.id).populate("lot");
    if (!o || String(o.lot.owner) !== String(q.user._id))
      return fail(s, 403, "Only lot owner can reject");
    o.status = "REJECTED";
    await o.save();
    ok(s, o, "Offer rejected");
  } catch (e) {
    n(e);
  }
});
app.get("/api/transactions", requireAuth, async (q, s, n) => {
  try {
    const f =
      q.user.role === "ADMIN"
        ? {}
        : { $or: [{ buyer: q.user._id }, { seller: q.user._id }] };
    ok(
      s,
      await Transaction.find(f)
        .populate("lot buyer seller")
        .sort({ createdAt: -1 }),
    );
  } catch (e) {
    n(e);
  }
});
app.patch("/api/transactions/:id/status", requireAuth, async (q, s, n) => {
  try {
    const t = await Transaction.findById(q.params.id);
    if (!t) return fail(s, 404, "Transaction not found", "NOT_FOUND");
    if (
      q.user.role !== "ADMIN" &&
      String(t.buyer) !== String(q.user._id) &&
      String(t.seller) !== String(q.user._id)
    )
      return fail(s, 403, "Not a participant");
    const allowedStatuses = ["CREATED", "CONFIRMED", "IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED", "DISPUTED"];
    if (!allowedStatuses.includes(q.body.status)) return fail(s, 422, "Invalid transaction status");
    if (q.user.role !== "ADMIN" && q.body.status === "DISPUTED") return fail(s, 403, "Only an administrator can mark a dispute");
    t.status = q.body.status;
    t.events.push({
      status: q.body.status,
      note: q.body.note || "Status updated",
    });
    await t.save();
    ok(s, t, "Transaction updated");
  } catch (e) {
    n(e);
  }
});
app.get("/api/disputes", requireAuth, async (q, s, n) => {
  try {
    const filter = q.user.role === "ADMIN" ? {} : { $or: [{ raisedBy: q.user._id }, { against: q.user._id }] };
    ok(s, await Dispute.find(filter).populate("transaction raisedBy against resolvedBy").sort({ createdAt: -1 }));
  } catch (e) { n(e); }
});
app.post("/api/disputes", requireAuth, async (q, s, n) => {
  try {
    const { transactionId, reason, description } = q.body;
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return fail(s, 404, "Transaction not found", "NOT_FOUND");
    if (String(transaction.buyer) !== String(q.user._id) && String(transaction.seller) !== String(q.user._id)) return fail(s, 403, "Only transaction participants can raise a dispute", "FORBIDDEN");
    if (!reason || !description) return fail(s, 422, "Reason and description are required");
    const against = String(transaction.buyer) === String(q.user._id) ? transaction.seller : transaction.buyer;
    transaction.status = "DISPUTED";
    transaction.events.push({ status: "DISPUTED", note: `Dispute raised: ${reason}` });
    await transaction.save();
    ok(s, await Dispute.create({ transaction: transaction._id, raisedBy: q.user._id, against, reason, description }), "Dispute raised");
  } catch (e) { n(e); }
});
app.patch("/api/disputes/:id", requireAuth, requireRole("ADMIN"), async (q, s, n) => {
  try {
    if (!["UNDER_REVIEW", "RESOLVED", "REJECTED"].includes(q.body.status)) return fail(s, 422, "Invalid dispute status");
    const dispute = await Dispute.findByIdAndUpdate(q.params.id, { status: q.body.status, resolution: q.body.resolution, resolvedBy: q.body.status === "RESOLVED" || q.body.status === "REJECTED" ? q.user._id : undefined, resolvedAt: q.body.status === "RESOLVED" || q.body.status === "REJECTED" ? new Date() : undefined }, { new: true }).populate("transaction raisedBy against resolvedBy");
    if (!dispute) return fail(s, 404, "Dispute not found", "NOT_FOUND");
    if (dispute.transaction && ["RESOLVED", "REJECTED"].includes(q.body.status)) await Transaction.findByIdAndUpdate(dispute.transaction._id, { status: q.body.status === "RESOLVED" ? "COMPLETED" : "CONFIRMED" });
    ok(s, dispute, "Dispute updated");
  } catch (e) { n(e); }
});
app.get("/api/payments/:transactionId", requireAuth, async (q, s, n) => {
  try {
    const t = await Transaction.findById(q.params.transactionId);
    if (!t) return fail(s, 404, "Transaction not found", "NOT_FOUND");
    if (q.user.role !== "ADMIN" && String(t.buyer) !== String(q.user._id) && String(t.seller) !== String(q.user._id)) return fail(s, 403, "Not a transaction participant", "FORBIDDEN");
    ok(s, await Payment.findOne({ transaction: t._id }));
  } catch (e) {
    n(e);
  }
});
app.patch("/api/payments/:transactionId", requireAuth, async (q, s, n) => {
  try {
    const t = await Transaction.findById(q.params.transactionId);
    if (!t) return fail(s, 404, "Transaction not found", "NOT_FOUND");
    if (q.user.role !== "ADMIN" && String(t.buyer) !== String(q.user._id) && String(t.seller) !== String(q.user._id)) return fail(s, 403, "Not a transaction participant", "FORBIDDEN");
    if (!["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED"].includes(q.body.status)) return fail(s, 422, "Invalid payment status");
    const p = await Payment.findOne({ transaction: t._id });
    if (!p) return fail(s, 404, "Payment not found");
    p.status = q.body.status;
    if (q.body.status === "PAID") p.paidAt = new Date();
    await p.save();
    ok(s, p, "Payment updated");
  } catch (e) {
    n(e);
  }
});
app.get("/api/notifications", requireAuth, async (q, s, n) => {
  try {
    ok(
      s,
      await Notification.find({ user: q.user._id })
        .sort({ createdAt: -1 })
        .limit(20),
    );
  } catch (e) {
    n(e);
  }
});
app.patch("/api/notifications/:id/read", requireAuth, async (q, s, n) => {
  try {
    const row = await Notification.findOneAndUpdate(
      { _id: q.params.id, user: q.user._id },
      { read: true },
      { new: true },
    );
    if (!row) return fail(s, 404, "Notification not found");
    ok(s, row, "Notification marked as read");
  } catch (e) {
    n(e);
  }
});
app.get("/api/storage", requireAuth, async (q, s, n) => {
  try {
    ok(s, await Warehouse.find());
  } catch (e) {
    n(e);
  }
});
app.post("/api/storage/book", requireAuth, async (q, s, n) => {
  try {
    const w = await Warehouse.findById(q.body.warehouseId);
    if (!w || !(q.body.quantity > 0) || q.body.quantity > w.availableCapacity)
      return fail(
        s,
        409,
        "Storage capacity unavailable",
        "CAPACITY_UNAVAILABLE",
      );
    const b = await StorageBooking.create({
      warehouse: w._id,
      user: q.user._id,
      quantity: q.body.quantity,
      days: q.body.days || 1,
      estimatedCost:
        q.body.quantity * (q.body.days || 1) * w.pricePerUnitPerDay,
    });
    w.availableCapacity -= q.body.quantity;
    await w.save();
    ok(s, b, "Storage booked successfully");
  } catch (e) {
    n(e);
  }
});
app.get("/api/logistics/providers", requireAuth, async (q, s, n) => {
  try {
    ok(s, await LogisticsProvider.find({ availability: true }));
  } catch (e) {
    n(e);
  }
});
app.post("/api/logistics/book", requireAuth, async (q, s, n) => {
  try {
    const p = await LogisticsProvider.findById(q.body.providerId);
    if (!p) return fail(s, 404, "Provider not found");
    const b = await LogisticsBooking.create({
      ...q.body,
      requestedBy: q.user._id,
      provider: p._id,
      estimatedCost:
        q.body.estimatedCost || p.pricePerKm * (q.body.distanceKm || 0),
    });
    ok(s, b, "Logistics booking created");
  } catch (e) {
    n(e);
  }
});
app.get("/api/payments", requireAuth, async (q, s, n) => {
  try {
    const txFilter =
      q.user.role === "ADMIN"
        ? {}
        : { $or: [{ buyer: q.user._id }, { seller: q.user._id }] };
    const tx = await Transaction.find(txFilter).select("_id");
    ok(
      s,
      await Payment.find({
        transaction: { $in: tx.map((x) => x._id) },
      }).populate({
        path: "transaction",
        populate: ["buyer", "seller", "lot"],
      }),
    );
  } catch (e) {
    n(e);
  }
});
app.get("/api/logistics/bookings", requireAuth, async (q, s, n) => {
  try {
    const filter = q.user.role === "ADMIN" ? {} : { requestedBy: q.user._id };
    ok(
      s,
      await LogisticsBooking.find(filter)
        .populate("provider transaction")
        .sort({ createdAt: -1 }),
    );
  } catch (e) {
    n(e);
  }
});
app.get("/api/storage/bookings", requireAuth, async (q, s, n) => {
  try {
    ok(
      s,
      await StorageBooking.find({ user: q.user._id })
        .populate("warehouse")
        .sort({ createdAt: -1 }),
    );
  } catch (e) {
    n(e);
  }
});
app.get(
  "/api/admin/users",
  requireAuth,
  requireRole("ADMIN"),
  async (q, s, n) => {
    try {
      ok(s, await User.find().select("-password").sort({ createdAt: -1 }));
    } catch (e) {
      n(e);
    }
  },
);
app.patch(
  "/api/admin/users/:id",
  requireAuth,
  requireRole("ADMIN"),
  async (q, s, n) => {
    try {
      const allowed = {};
      if (["PENDING", "VERIFIED", "REJECTED"].includes(q.body.verification))
        allowed.verification = q.body.verification;
      if (typeof q.body.active === "boolean") allowed.active = q.body.active;
      const user = await User.findByIdAndUpdate(q.params.id, allowed, {
        new: true,
      }).select("-password");
      if (!user) return fail(s, 404, "User not found");
      ok(s, user, "User status updated");
    } catch (e) {
      n(e);
    }
  },
);
app.post(
  "/api/fpo/aggregate",
  requireAuth,
  requireRole("FPO"),
  async (q, s, n) => {
    try {
      const ids = q.body.lotIds || [],
        fpo = await User.findById(q.user._id).select("members location"),
        source = await Lot.find({
          _id: { $in: ids },
          owner: { $in: fpo.members || [] },
          status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
        });
      if (!source.length)
        return fail(s, 422, "Select at least one available lot");
      const commodity = source[0].commodity;
      if (source.some((x) => x.commodity !== commodity))
        return fail(s, 422, "Only one commodity can be aggregated at a time");
      const quantity = source.reduce((a, x) => a + x.remainingQuantity, 0),
        lot = await Lot.create({
          owner: q.user._id,
          ownerType: "FPO",
          sourceLots: source.map((x) => x._id),
          commodity,
          quantity,
          remainingQuantity: quantity,
          unit: source[0].unit,
          location: q.user.location,
          expectedPrice:
            q.body.expectedPrice ||
            source.reduce((a, x) => a + x.expectedPrice, 0) / source.length,
          quality: source[0].quality,
          availableUntil:
            q.body.availableUntil || new Date(Date.now() + 14 * 86400000),
        });
      await Lot.updateMany(
        { _id: { $in: source.map((x) => x._id) } },
        { status: "CANCELLED" },
      );
      ok(s, lot, "FPO aggregated lot created");
    } catch (e) {
      n(e);
    }
  },
);
app.get(
  "/api/admin/summary",
  requireAuth,
  requireRole("ADMIN"),
  async (q, s, n) => {
    try {
      const [farmers, buyers, lots, demands, transactions] = await Promise.all([
        User.countDocuments({ role: "FARMER" }),
        User.countDocuments({ role: "BUYER" }),
        Lot.countDocuments({
          status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
        }),
        Demand.countDocuments({ status: "ACTIVE" }),
        Transaction.find(),
      ]);
      ok(s, {
        farmers,
        buyers,
        activeLots: lots,
        activeDemands: demands,
        transactions: transactions.length,
        tradeValue: transactions.reduce((a, t) => a + t.amount, 0),
      });
    } catch (e) {
      n(e);
    }
  },
);
app.get("/api/admin/analytics", requireAuth, requireRole("ADMIN"), async (q, s, n) => {
  try {
    const [users, lots, demands, offers, transactions, payments] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Lot.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, volume: { $sum: "$remainingQuantity" } } }]),
      Demand.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Offer.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$totalAmount" } } }]),
      Transaction.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$amount" } } }]),
      Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$amount" } } }]),
    ]);
    ok(s, { users, lots, demands, offers, transactions, payments });
  } catch (e) { n(e); }
});
app.get("/api/buyers/:id/reliability", requireAuth, async (q, s, n) => {
  try {
    const buyer = await User.findOne({ _id: q.params.id, role: "BUYER" });
    if (!buyer) return fail(s, 404, "Buyer not found", "NOT_FOUND");
    const tx = await Transaction.find({ buyer: buyer._id });
    const completed = tx.filter((x) => x.status === "COMPLETED").length,
      cancelled = tx.filter((x) => x.status === "CANCELLED").length,
      disputed = tx.filter((x) => x.status === "DISPUTED").length;
    const score = Math.max(
      0,
      Math.min(100, 85 + completed * 3 - cancelled * 10 - disputed * 12),
    );
    ok(s, {
      buyer: { id: buyer._id, name: buyer.name },
      score,
      completed,
      cancelled,
      disputed,
      label: score >= 85 ? "Excellent" : score >= 65 ? "Good" : "Needs review",
    });
  } catch (e) {
    n(e);
  }
});
app.get(
  "/api/fpo/farmers",
  requireAuth,
  requireRole("FPO"),
  async (q, s, n) => {
    try {
      const search = (q.query.search || "").trim();
      const f = {
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
      ok(s, await User.find(f).select("-password").sort({ name: 1 }).limit(30));
    } catch (e) {
      n(e);
    }
  },
);
app.get(
  "/api/fpo/members",
  requireAuth,
  requireRole("FPO"),
  async (q, s, n) => {
    try {
      const fpo = await User.findById(q.user._id).populate({
        path: "members",
        select: "name email phone location farmName primaryCrop verification",
      });
      ok(s, fpo.members || []);
    } catch (e) {
      n(e);
    }
  },
);
app.post(
  "/api/fpo/members",
  requireAuth,
  requireRole("FPO"),
  async (q, s, n) => {
    try {
      const farmer = await User.findOne({
        _id: q.body.farmerId,
        role: "FARMER",
        active: true,
      });
      if (!farmer) return fail(s, 404, "Farmer not found", "NOT_FOUND");
      await User.findByIdAndUpdate(q.user._id, {
        $addToSet: { members: farmer._id },
      });
      ok(s, farmer, "Farmer added to FPO");
    } catch (e) {
      n(e);
    }
  },
);
app.delete(
  "/api/fpo/members/:farmerId",
  requireAuth,
  requireRole("FPO"),
  async (q, s, n) => {
    try {
      await User.findByIdAndUpdate(q.user._id, {
        $pull: { members: q.params.farmerId },
      });
      ok(s, {}, "Farmer removed from FPO");
    } catch (e) {
      n(e);
    }
  },
);
app.get("/api/fpo/lots", requireAuth, requireRole("FPO"), async (q, s, n) => {
  try {
    const fpo = await User.findById(q.user._id).select("members");
    ok(
      s,
      await Lot.find({
        owner: { $in: [...(fpo.members || []), q.user._id] },
        status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] },
      })
        .populate("owner quality")
        .sort({ createdAt: -1 }),
    );
  } catch (e) {
    n(e);
  }
});
app.use((e, q, s, n) => {
  console.error(e);
  fail(s, 500, "Something went wrong", "SERVER_ERROR");
});
export default app;
