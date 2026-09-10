<<<<<<< HEAD
// import mongoose from 'mongoose';
// const {Schema,model}=mongoose;
// const loc={type:{type:String,default:'Point'},coordinates:{type:[Number],default:[75.86,22.72]}};
// // export const User=model('User',new Schema({name:{type:String,required:true,trim:true},email:{type:String,unique:true,lowercase:true,required:true,trim:true},password:{type:String,required:true},role:{type:String,enum:['ADMIN','FARMER','FPO','BUYER','KRISHI_KENDRA'],default:'FARMER'},phone:{type:String,trim:true},location:{type:String,trim:true},address:{type:String,trim:true},district:{type:String,trim:true},state:{type:String,trim:true},pincode:{type:String,trim:true},organizationName:{type:String,trim:true},buyerType:{type:String,trim:true},farmName:{type:String,trim:true},landSize:Number,primaryCrop:{type:String,trim:true},registrationNumber:{type:String,trim:true},memberCount:Number,members:[{type:Schema.Types.ObjectId,ref:'User'}],geo:loc,verification:{type:String,default:'PENDING'},active:{type:Boolean,default:true}},{timestamps:true}));
// export const Quality=model('Quality',new Schema({grade:{type:String,default:'Grade A'},moisture:Number,foreignMatter:Number,damagedPercentage:Number,defects:String,grainImage:String,certification:String,inspectionDate:Date,inspectedBy:{type:Schema.Types.ObjectId,ref:'User'},inspectionStatus:{type:String,enum:['PENDING','VERIFIED','REJECTED'],default:'PENDING'},inspectionNotes:String}));
// export const Lot=model('Lot',new Schema({owner:{type:Schema.Types.ObjectId,ref:'User',required:true},ownerType:{type:String,default:'FARMER'},sourceLots:[{type:Schema.Types.ObjectId,ref:'Lot'}],commodity:{type:String,required:true,index:true},quantity:{type:Number,required:true},remainingQuantity:Number,unit:{type:String,default:'KG'},harvestDate:Date,location:String,geo:loc,expectedPrice:{type:Number,required:true},quality:{type:Schema.Types.ObjectId,ref:'Quality'},availableUntil:Date,status:{type:String,enum:['AVAILABLE','PARTIALLY_SOLD','SOLD','EXPIRED','CANCELLED'],default:'AVAILABLE'}},{timestamps:true})); Lot.schema.index({geo:'2dsphere'});
// export const Demand=model('Demand',new Schema({buyer:{type:Schema.Types.ObjectId,ref:'User',required:true},commodity:{type:String,required:true,index:true},requiredQuantity:{type:Number,required:true},unit:{type:String,default:'KG'},requiredQuality:{type:String,default:'Grade A'},preferredLocation:String,maxPrice:{type:Number,required:true},deadline:Date,status:{type:String,default:'ACTIVE'}},{timestamps:true}));
// export const Market=model('Market',new Schema({name:String,location:String,district:String,state:String,commodities:[String],geo:loc,transportCostPerKm:{type:Number,default:8},reviewAverage:{type:Number,default:4.2,min:0,max:5},reviewCount:{type:Number,default:0,min:0}})); Market.schema.index({geo:'2dsphere'});
// export const MarketPrice=model('MarketPrice',new Schema({market:{type:Schema.Types.ObjectId,ref:'Market'},commodity:{type:String,index:true},date:{type:Date,index:true},minPrice:Number,maxPrice:Number,modalPrice:Number,arrivalVolume:Number,unit:{type:String,default:'KG'}}));
// export const Offer=model('Offer',new Schema({lot:{type:Schema.Types.ObjectId,ref:'Lot',required:true},buyer:{type:Schema.Types.ObjectId,ref:'User',required:true},quantity:{type:Number,required:true},pricePerUnit:{type:Number,required:true},totalAmount:Number,message:String,validUntil:Date,status:{type:String,enum:['PENDING','ACCEPTED','REJECTED','EXPIRED','CANCELLED'],default:'PENDING'}},{timestamps:true}));
// export const Transaction=model('Transaction',new Schema({offer:{type:Schema.Types.ObjectId,ref:'Offer',unique:true},lot:{type:Schema.Types.ObjectId,ref:'Lot'},buyer:{type:Schema.Types.ObjectId,ref:'User'},seller:{type:Schema.Types.ObjectId,ref:'User'},quantity:Number,amount:Number,status:{type:String,enum:['CREATED','CONFIRMED','IN_TRANSIT','DELIVERED','COMPLETED','CANCELLED','DISPUTED'],default:'CREATED'},events:[{status:String,note:String,at:{type:Date,default:Date.now}}]},{timestamps:true}));
// export const Payment=model('Payment',new Schema({transaction:{type:Schema.Types.ObjectId,ref:'Transaction',unique:true},amount:Number,paymentMethod:{type:String,default:'Bank Transfer'},referenceId:String,status:{type:String,enum:['PENDING','PROCESSING','PAID','FAILED','REFUNDED'],default:'PENDING'},paidAt:Date,remarks:String},{timestamps:true}));
// export const Notification=model('Notification',new Schema({user:{type:Schema.Types.ObjectId,ref:'User'},message:String,type:String,read:{type:Boolean,default:false}},{timestamps:true}));
// export const Warehouse=model('Warehouse',new Schema({name:String,location:String,availableCapacity:Number,storageType:String,pricePerUnitPerDay:Number,facilities:[String],verificationStatus:{type:String,default:'VERIFIED'}}));
// export const LogisticsProvider=model('LogisticsProvider',new Schema({name:String,phone:String,vehicleType:String,capacity:Number,serviceAreas:[String],pricePerKm:Number,availability:{type:Boolean,default:true}}));
// export const LogisticsBooking=model('LogisticsBooking',new Schema({requestedBy:{type:Schema.Types.ObjectId,ref:'User'},transaction:{type:Schema.Types.ObjectId,ref:'Transaction'},provider:{type:Schema.Types.ObjectId,ref:'LogisticsProvider'},pickupLocation:String,deliveryLocation:String,quantity:Number,estimatedCost:Number,status:{type:String,default:'REQUESTED'}},{timestamps:true}));
// export const StorageBooking=model('StorageBooking',new Schema({warehouse:{type:Schema.Types.ObjectId,ref:'Warehouse'},user:{type:Schema.Types.ObjectId,ref:'User'},quantity:Number,days:Number,estimatedCost:Number,status:{type:String,default:'BOOKED'}},{timestamps:true}));
// export const Dispute=model('Dispute',new Schema({transaction:{type:Schema.Types.ObjectId,ref:'Transaction',required:true},raisedBy:{type:Schema.Types.ObjectId,ref:'User',required:true},against:{type:Schema.Types.ObjectId,ref:'User',required:true},reason:{type:String,required:true},description:{type:String,required:true},status:{type:String,enum:['OPEN','UNDER_REVIEW','RESOLVED','REJECTED'],default:'OPEN'},resolution:String,resolvedBy:{type:Schema.Types.ObjectId,ref:'User'},resolvedAt:Date},{timestamps:true}));

// const locationSchema = new Schema(
//   {
//     type: {
//       type: String,
//       enum: ["Point"],
//       default: "Point",
//       required: true,
//     },

//     // GeoJSON uses [longitude, latitude]
//     coordinates: {
//       type: [Number],
//       required: true,
//       validate: {
//         validator: function (value) {
//           return (
//             value.length === 2 &&
//             value[0] >= -180 &&
//             value[0] <= 180 &&
//             value[1] >= -90 &&
//             value[1] <= 90
//           );
//         },
//         message:
//           "Coordinates must be [longitude, latitude] with valid values",
//       },
//     },
//   },
//   { _id: false }
// );

// export const User = model(
//   "User",
//   new Schema(
//     {
//       name: {
//         type: String,
//         required: true,
//         trim: true,
//       },

//       email: {
//         type: String,
//         unique: true,
//         lowercase: true,
//         required: true,
//         trim: true,
//       },

//       password: {
//         type: String,
//         required: true,
//       },

//       role: {
//         type: String,
//         enum: [
//           "ADMIN",
//           "FARMER",
//           "FPO",
//           "BUYER",
//           "KRISHI_KENDRA",
//         ],
//         default: "FARMER",
//       },

//       phone: {
//         type: String,
//         trim: true,
//       },

//       location: {
//         type: String,
//         trim: true,
//       },

//       address: {
//         type: String,
//         trim: true,
//       },

//       district: {
//         type: String,
//         trim: true,
//       },

//       state: {
//         type: String,
//         trim: true,
//       },

//       pincode: {
//         type: String,
//         trim: true,
//       },

//       organizationName: {
//         type: String,
//         trim: true,
//       },

//       buyerType: {
//         type: String,
//         trim: true,
//       },

//       farmName: {
//         type: String,
//         trim: true,
//       },

//       landSize: Number,

//       primaryCrop: {
//         type: String,
//         trim: true,
//       },

//       registrationNumber: {
//         type: String,
//         trim: true,
//       },

//       memberCount: Number,

//       members: [
//         {
//           type: Schema.Types.ObjectId,
//           ref: "User",
//         },
//       ],

//       // GPS LOCATION
//       geo: {
//         type: locationSchema,
//         required: false,
//       },

//       verification: {
//         type: String,
//         default: "PENDING",
//       },

//       active: {
//         type: Boolean,
//         default: true,
//       },
//     },
//     {
//       timestamps: true,
//     }
//   )
// );
import mongoose from "mongoose";

const { Schema, model } = mongoose;

/* =========================================================
   GEO LOCATION SCHEMA
   GeoJSON format:
   {
     type: "Point",
     coordinates: [longitude, latitude]
   }
========================================================= */

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },

    // IMPORTANT:
    // GeoJSON uses [longitude, latitude]
    coordinates: {
      type: [Number],
      required: true,

      validate: {
        validator: function (value) {
          return (
            value.length === 2 &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90
          );
        },

        message:
          "Coordinates must be [longitude, latitude] with valid values",
      },
    },
  },
  {
    _id: false,
  }
);


/* =========================================================
   USER
========================================================= */

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "ADMIN",
        "FARMER",
        "FPO",
        "BUYER",
        "KRISHI_KENDRA",
      ],
      default: "FARMER",
    },

    phone: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    organizationName: {
      type: String,
      trim: true,
    },

    buyerType: {
      type: String,
      trim: true,
    },

    farmName: {
      type: String,
      trim: true,
    },

    landSize: {
      type: Number,
    },

    primaryCrop: {
      type: String,
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
    },

    memberCount: {
      type: Number,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // GPS LOCATION
    geo: {
      type: locationSchema,
      required: false,
    },

    verification: {
      type: String,
      default: "PENDING",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
UserSchema.index({
  geo: "2dsphere",
});

export const User = model("User", UserSchema);


/* =========================================================
   QUALITY
========================================================= */

const QualitySchema = new Schema(
  {
    grade: {
      type: String,
      default: "Grade A",
    },

    moisture: {
      type: Number,
    },

    foreignMatter: {
      type: Number,
    },

    damagedPercentage: {
      type: Number,
    },

    defects: {
      type: String,
    },

    grainImage: {
      type: String,
    },

    certification: {
      type: String,
    },

    inspectionDate: {
      type: Date,
    },

    inspectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    inspectionStatus: {
      type: String,
      enum: [
        "PENDING",
        "VERIFIED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    inspectionNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Quality = model("Quality", QualitySchema);


/* =========================================================
   LOT
========================================================= */

const LotSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerType: {
      type: String,
      default: "FARMER",
    },

    sourceLots: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lot",
      },
    ],

    commodity: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    remainingQuantity: {
      type: Number,
    },

    unit: {
      type: String,
      default: "KG",
    },

    harvestDate: {
      type: Date,
    },

    location: {
      type: String,
      trim: true,
    },

    // GPS LOCATION
    geo: {
      type: locationSchema,
      required: false,
    },

    expectedPrice: {
      type: Number,
      required: true,
    },

    quality: {
      type: Schema.Types.ObjectId,
      ref: "Quality",
    },

    availableUntil: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "PARTIALLY_SOLD",
        "SOLD",
        "EXPIRED",
        "CANCELLED",
      ],
      default: "AVAILABLE",
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
LotSchema.index({
  geo: "2dsphere",
});

export const Lot = model("Lot", LotSchema);


/* =========================================================
   DEMAND
========================================================= */

const DemandSchema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    commodity: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    requiredQuantity: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      default: "KG",
    },

    requiredQuality: {
      type: String,
      default: "Grade A",
    },

    preferredLocation: {
      type: String,
      trim: true,
    },

    maxPrice: {
      type: Number,
      required: true,
    },

    deadline: {
      type: Date,
    },

    status: {
      type: String,
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export const Demand = model("Demand", DemandSchema);


/* =========================================================
   MARKET / MANDI
========================================================= */

const MarketSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    commodities: [
      {
        type: String,
        trim: true,
      },
    ],

    // GPS LOCATION
    geo: {
      type: locationSchema,
      required: false,
    },

    transportCostPerKm: {
      type: Number,
      default: 8,
    },

    reviewAverage: {
      type: Number,
      default: 4.2,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
MarketSchema.index({
  geo: "2dsphere",
});

export const Market = model("Market", MarketSchema);


/* =========================================================
   MARKET PRICE
========================================================= */

const MarketPriceSchema = new Schema(
  {
    market: {
      type: Schema.Types.ObjectId,
      ref: "Market",
      required: true,
    },

    commodity: {
      type: String,
      index: true,
      trim: true,
    },

    date: {
      type: Date,
      index: true,
    },

    minPrice: {
      type: Number,
    },

    maxPrice: {
      type: Number,
    },

    modalPrice: {
      type: Number,
    },

    arrivalVolume: {
      type: Number,
    },

    unit: {
      type: String,
      default: "KG",
    },
  },
  {
    timestamps: true,
  }
);

export const MarketPrice = model(
  "MarketPrice",
  MarketPriceSchema
);


/* =========================================================
   OFFER
========================================================= */

const OfferSchema = new Schema(
  {
    lot: {
      type: Schema.Types.ObjectId,
      ref: "Lot",
      required: true,
    },

    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    pricePerUnit: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
    },

    message: {
      type: String,
    },

    validUntil: {
      type: Date,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export const Offer = model("Offer", OfferSchema);


/* =========================================================
   TRANSACTION
========================================================= */

const TransactionSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      unique: true,
    },

    lot: {
      type: Schema.Types.ObjectId,
      ref: "Lot",
    },

    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    quantity: {
      type: Number,
    },

    amount: {
      type: Number,
    },

    status: {
      type: String,
      enum: [
        "CREATED",
        "CONFIRMED",
        "IN_TRANSIT",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "DISPUTED",
      ],
      default: "CREATED",
    },

    events: [
      {
        status: {
          type: String,
        },

        note: {
          type: String,
        },

        at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Transaction = model(
  "Transaction",
  TransactionSchema
);


/* =========================================================
   PAYMENT
========================================================= */

const PaymentSchema = new Schema(
  {
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      unique: true,
    },

    amount: {
      type: Number,
    },

    paymentMethod: {
      type: String,
      default: "Bank Transfer",
    },

    referenceId: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "PROCESSING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    paidAt: {
      type: Date,
    },

    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model("Payment", PaymentSchema);


/* =========================================================
   NOTIFICATION
========================================================= */

const NotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    message: {
      type: String,
    },

    type: {
      type: String,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model(
  "Notification",
  NotificationSchema
);


/* =========================================================
   WAREHOUSE
========================================================= */

const WarehouseSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    availableCapacity: {
      type: Number,
    },

    storageType: {
      type: String,
    },

    pricePerUnitPerDay: {
      type: Number,
    },

    facilities: [
      {
        type: String,
      },
    ],

    verificationStatus: {
      type: String,
      default: "VERIFIED",
    },
  },
  {
    timestamps: true,
  }
);

export const Warehouse = model(
  "Warehouse",
  WarehouseSchema
);


/* =========================================================
   LOGISTICS PROVIDER
========================================================= */

const LogisticsProviderSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    vehicleType: {
      type: String,
    },

    capacity: {
      type: Number,
    },

    serviceAreas: [
      {
        type: String,
      },
    ],

    pricePerKm: {
      type: Number,
    },

    availability: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LogisticsProvider = model(
  "LogisticsProvider",
  LogisticsProviderSchema
);


/* =========================================================
   LOGISTICS BOOKING
========================================================= */

const LogisticsBookingSchema = new Schema(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },

    provider: {
      type: Schema.Types.ObjectId,
      ref: "LogisticsProvider",
    },

    pickupLocation: {
      type: String,
    },

    deliveryLocation: {
      type: String,
    },

    quantity: {
      type: Number,
    },

    estimatedCost: {
      type: Number,
    },

    status: {
      type: String,
      default: "REQUESTED",
    },
  },
  {
    timestamps: true,
  }
);

export const LogisticsBooking = model(
  "LogisticsBooking",
  LogisticsBookingSchema
);


/* =========================================================
   STORAGE BOOKING
========================================================= */

const StorageBookingSchema = new Schema(
  {
    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    quantity: {
      type: Number,
    },

    days: {
      type: Number,
    },

    estimatedCost: {
      type: Number,
    },

    status: {
      type: String,
      default: "BOOKED",
    },
  },
  {
    timestamps: true,
  }
);

export const StorageBooking = model(
  "StorageBooking",
  StorageBookingSchema
);


/* =========================================================
   DISPUTE
========================================================= */

const DisputeSchema = new Schema(
  {
    transaction: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },

    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    against: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "UNDER_REVIEW",
        "RESOLVED",
        "REJECTED",
      ],
      default: "OPEN",
    },

    resolution: {
      type: String,
    },

    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Dispute = model("Dispute", DisputeSchema);
=======
export { User } from "./User.js";
export { Quality } from "./Quality.js";
export { Lot } from "./Lot.js";
export { Demand } from "./Demand.js";
export { Market } from "./Market.js";
export { MarketPrice } from "./MarketPrice.js";
export { Offer } from "./Offer.js";
export { Transaction } from "./Transaction.js";
export { Payment } from "./Payment.js";
export { Notification } from "./Notification.js";
export { Warehouse } from "./Warehouse.js";
export { LogisticsProvider } from "./LogisticsProvider.js";
export { LogisticsBooking } from "./LogisticsBooking.js";
export { StorageBooking } from "./StorageBooking.js";
export { Dispute } from "./Dispute.js";
>>>>>>> 719931bac6b098f0ff68f6a02fb3be01dceb4af8
