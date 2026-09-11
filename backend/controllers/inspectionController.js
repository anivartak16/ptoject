import { Lot, Quality, Notification } from "../models/index.js";
import { ok, fail } from "../utils/response.js";

export async function inspectionLots(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = {
        $in: [
          "PENDING_VERIFICATION",
          "VERIFIED",
          "REJECTED",
          "AVAILABLE",
          "PARTIALLY_SOLD",
        ],
      };
    }

    if (req.query.commodity) {
      filter.commodity = req.query.commodity;
    }

    const lots = await Lot.find(filter)
      .populate(
        "owner quality",
        "name email phone location district state primaryCrop farmName organizationName grade moisture foreignMatter damagedPercentage defects inspectionStatus inspectionNotes certification inspectionDate",
      )
      .sort({ createdAt: -1 });
    return ok(res, lots);
  } catch (error) {
    next(error);
  }
}

export async function createInspection(req, res, next) {
  try {
    const {
      lotId,
      grade,
      moisture,
      foreignMatter,
      damagedPercentage,
      defects,
      grainImage,
      inspectionNotes,
      inspectionStatus = "VERIFIED",
    } = req.body;

    const lot = await Lot.findById(lotId).populate("owner");
    if (!lot) return fail(res, 404, "Lot not found", "NOT_FOUND");
    if (lot.status === "SOLD" || lot.status === "CANCELLED") {
      return fail(res, 409, "This lot is not available for inspection");
    }
    if (!(Number(moisture) >= 0 && Number(moisture) <= 100)) {
      return fail(res, 422, "Moisture must be between 0 and 100");
    }
    if (
      grainImage &&
      (!grainImage.startsWith("data:image/") || grainImage.length > 4_000_000)
    ) {
      return fail(
        res,
        422,
        "Grain image must be a valid image smaller than 3 MB",
      );
    }
    if (!["PENDING", "VERIFIED", "REJECTED"].includes(inspectionStatus)) {
      return fail(res, 422, "Invalid inspection status");
    }

    const quality = lot.quality
      ? await Quality.findById(lot.quality)
      : await Quality.create({});

    const centerName =
      req.user.organizationName || req.user.name || "Krishi Vigyan Kendra";

    Object.assign(quality, {
      grade: inspectionStatus === "REJECTED" ? "Rejected" : grade || "Grade A",
      moisture: Number(moisture),
      foreignMatter: Number(foreignMatter || 0),
      damagedPercentage: Number(damagedPercentage || 0),
      defects: defects || "",
      grainImage,
      inspectionNotes: inspectionNotes || "",
      inspectionStatus,
      inspectedBy: req.user._id,
      inspectionDate: new Date(),
      certification:
        inspectionStatus === "VERIFIED"
          ? `Krishi Vigyan Kendra Certified (${centerName})`
          : `Inspection Rejected (${centerName})`,
    });

    await quality.save();
    lot.quality = quality._id;

    if (inspectionStatus === "VERIFIED") {
      lot.status = "VERIFIED"; // Ready for farmer to list on marketplace
    } else if (inspectionStatus === "REJECTED") {
      lot.status = "REJECTED";
    }
    await lot.save();

    // Notify farmer of verification result
    try {
      if (lot.owner?._id) {
        await Notification.create({
          user: lot.owner._id,
          type:
            inspectionStatus === "VERIFIED"
              ? "LOT_VERIFIED"
              : "LOT_INSPECTION_REJECTED",
          message:
            inspectionStatus === "VERIFIED"
              ? `✓ Your lot of ${lot.commodity} (${lot.remainingQuantity || lot.quantity} kg) was verified by ${centerName} as ${grade}. You can now list it on the marketplace!`
              : `✕ Inspection Notice: Your lot of ${lot.commodity} was rejected by ${centerName}. Reason: ${defects || inspectionNotes || "Failed moisture/quality standards"}.`,
        });
      }
    } catch (_notifyErr) {
      // Non-blocking notification failure
    }

    const populated = await Lot.findById(lot._id).populate("owner quality");
    return ok(
      res,
      populated,
      inspectionStatus === "VERIFIED"
        ? "Quality verified and certified! Farmer can now list produce on the marketplace."
        : "Inspection recorded as rejected.",
    );
  } catch (error) {
    next(error);
  }
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