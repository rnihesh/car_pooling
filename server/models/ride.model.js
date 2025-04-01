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
  },
  {
    strict: "throw",
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
      enum: ["Car", "Bike"],
    },
    nuSeats: {
      type: Number,
      default: 0,
    },
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    isRideActive:{
      type: Boolean,
      default: true
    }
  },
  {
    strict: "throw",
  }
);

const ridesSchema = new mongoose.Schema(
  {
    userData: userSchema,
    ride: {
      type: [rideSchema],
    }
  },
  {
    strict: "throw",
  }
);

const Rides = mongoose.model("rides", ridesSchema);

module.exports = Rides;
