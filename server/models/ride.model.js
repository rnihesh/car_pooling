const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
    },
    baseID: {
      type: String,
      required: true,
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const requestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phNum: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
    },
    request: {
      type: Boolean,
      default: false,
      required: true,
    },
    decline: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const rideSchema = new mongoose.Schema(
  {
    rideId: {
      type: String,
      required: true,
    },
    typeOfVeh: {
      type: String,
      required: true,
      enum: ["Car", "Bike"],
    },
    nuSeats: {
      type: Number,
      default: 0,
    },
    start: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    end: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    time: {
      type: Date,
      required: true,
    },
    requests: {
      type: [requestSchema],
    },
    isRideActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    strict: "throw",

    timestamps: true,
  }
);0

// Geospatial index for radius‐searches
rideSchema.index({ start: "2dsphere" });
rideSchema.index({ end: "2dsphere" });

// Compound index to speed up “active rides sorted by time”
rideSchema.index({ isRideActive: 1, time: 1 });

rideSchema.index({ rideId: 1 }, { unique: true });

const ridesSchema = new mongoose.Schema(
  {
    userData: userSchema,
    ride: {
      type: [rideSchema],
    },
  },
  {
    strict: "throw",
  }
);

const Rides = mongoose.model("rides", ridesSchema);

Rides.on("index", (err) => {
  if (err) console.error("Index build error:", err);
});

module.exports = Rides;
