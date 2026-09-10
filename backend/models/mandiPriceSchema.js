import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Stores daily mandi price records synced from the AGMARKNET / data.gov.in API.
 *
 * One document = one (market, commodity, variety, arrivalDate) price report.
 * The compound unique index below is what lets you re-run the sync every day
 * without creating duplicate rows — it upserts instead.
 */
const mandiPriceSchema = new Schema(
  {
    state: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    market: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional link to your own Market collection.
    // AGMARKNET doesn't provide lat/long, so this remains null
    // until matched with your Market collection.
    marketRef: {
      type: Schema.Types.ObjectId,
      ref: "Market",
      default: null,
    },

    commodity: {
      type: String,
      required: true,
      trim: true,
    },

    variety: {
      type: String,
      trim: true,
      default: "",
    },

    grade: {
      type: String,
      trim: true,
      default: "",
    },

    arrivalDate: {
      type: Date,
      required: true,
    },

    minPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    maxPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    modalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    source: {
      type: String,
      default: "AGMARKNET",
    },

    // When our sync job pulled this record.
    // Different from arrivalDate, which is the mandi's reported trading date.
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

// Prevent duplicate rows when the same day's data
// is fetched more than once.
mandiPriceSchema.index(
  {
    state: 1,
    district: 1,
    market: 1,
    commodity: 1,
    variety: 1,
    arrivalDate: 1,
  },
  {
    unique: true,
    name: "uniq_price_report",
  }
);

// Dashboard queries:
// "Wheat prices in Madhya Pradesh, most recent first"
mandiPriceSchema.index({
  state: 1,
  commodity: 1,
  arrivalDate: -1,
});

// "Wheat prices across all states"
mandiPriceSchema.index({
  commodity: 1,
  arrivalDate: -1,
});

// "Everything traded in this district"
mandiPriceSchema.index({
  state: 1,
  district: 1,
  arrivalDate: -1,
});

// Text search on commodity name
mandiPriceSchema.index({
  commodity: "text",
});

// --------------------------------------------------
// BULK UPSERT
// --------------------------------------------------

/**
 * Bulk upsert a batch of normalized AGMARKNET records.
 *
 * Safe to call repeatedly — existing rows for the same
 * market, commodity, variety and date are updated.
 */
mandiPriceSchema.statics.bulkUpsert = async function (records) {
  if (!records || records.length === 0) {
    return {
      upsertedCount: 0,
      modifiedCount: 0,
    };
  }

  const operations = records.map((rec) => {
    const arrivalDate = toDate(rec.arrivalDate);

    const filter = {
      state: rec.state,
      district: rec.district,
      market: rec.market,
      commodity: rec.commodity,
      variety: rec.variety || "",
      arrivalDate,
    };

    return {
      updateOne: {
        filter,

        update: {
          $set: {
            grade: rec.grade || "",
            minPrice: rec.minPrice,
            maxPrice: rec.maxPrice,
            modalPrice: rec.modalPrice,
            source: rec.source || "AGMARKNET",
            fetchedAt: new Date(),
          },

          $setOnInsert: filter,
        },

        upsert: true,
      },
    };
  });

  const result = await this.bulkWrite(operations, {
    ordered: false,
  });

  return {
    upsertedCount: result.upsertedCount || 0,
    modifiedCount: result.modifiedCount || 0,
    matchedCount: result.matchedCount || 0,
  };
};

// --------------------------------------------------
// DATE CONVERTER
// --------------------------------------------------

/**
 * AGMARKNET returns dates as "DD/MM/YYYY" strings.
 * Convert them into a real Date.
 */
function toDate(value) {
  if (value instanceof Date) {
    return value;
  }

  const [day, month, year] = String(value)
    .split("/")
    .map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );
}

// Make the helper available as MandiPrice.toDate()
mandiPriceSchema.statics.toDate = toDate;

// --------------------------------------------------
// MODEL EXPORT
// --------------------------------------------------

const MandiPrice = mongoose.model(
  "MandiPrice",
  mandiPriceSchema
);

export default MandiPrice;