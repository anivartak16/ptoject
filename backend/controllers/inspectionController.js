import { Lot, Quality } from "../models/index.js";

const ok = (res, data, message = "Success") => res.json({ success: true, message, data });
const fail = (res, status, message, error = "VALIDATION_ERROR") => res.status(status).json({ success: false, message, error });

export async function inspectionLots(_req, res, next) {
  try {
    const lots = await Lot.find({ status: { $in: ["AVAILABLE", "PARTIALLY_SOLD"] } })
      .populate("owner quality", "name email location commodity grade moisture inspectionStatus")
      .sort({ createdAt: -1 });
    ok(res, lots);
  } catch (error) { next(error); }
}

export async function createInspection(req, res, next) {
  try {
    const { lotId, grade, moisture, foreignMatter, damagedPercentage, defects, grainImage, inspectionNotes, inspectionStatus = "VERIFIED" } = req.body;
    const lot = await Lot.findById(lotId).populate("owner");
    if (!lot) return fail(res, 404, "Lot not found", "NOT_FOUND");
    if (lot.status === "SOLD" || lot.status === "CANCELLED") return fail(res, 409, "This lot is not available for inspection");
    if (!(Number(moisture) >= 0 && Number(moisture) <= 100)) return fail(res, 422, "Moisture must be between 0 and 100");
    if (grainImage && (!grainImage.startsWith("data:image/") || grainImage.length > 4_000_000)) return fail(res, 422, "Grain image must be a valid image smaller than 3 MB");
    if (!["PENDING", "VERIFIED", "REJECTED"].includes(inspectionStatus)) return fail(res, 422, "Invalid inspection status");
    const quality = lot.quality ? await Quality.findById(lot.quality) : await Quality.create({});
    Object.assign(quality, { grade, moisture: Number(moisture), foreignMatter: Number(foreignMatter || 0), damagedPercentage: Number(damagedPercentage || 0), defects, grainImage, inspectionNotes, inspectionStatus, inspectedBy: req.user._id, inspectionDate: new Date(), certification: "Krishi Kendra verified" });
    await quality.save();
    lot.quality = quality._id;
    await lot.save();
    ok(res, await Lot.findById(lot._id).populate("owner quality"), "Grain inspection recorded");
  } catch (error) { next(error); }
}

// import express from "express";
// import { generateChatResponse } from "../services/intelligence.js";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message || !message.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Message is required",
//       });
//     }

//     const reply = await generateChatResponse(message);

//     res.json({
//       success: true,
//       reply,
//     });
//   } catch (error) {
//     console.error("Chat route error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Unable to generate AI response",
//     });
//   }
// });

// export default router;