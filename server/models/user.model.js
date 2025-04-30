const { request } = require("express");
const mongoose = require("mongoose");

const notiSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    rideId: {
      type: String,
      required: true,
    },
    start: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    end: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    role: {
      type: String,
      required: true,
    }, 
    requesterId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    accepted:{
      type: Boolean,

    },
    declined: {
      type: Boolean
    }

  },
  {
    strict: "throw",
  }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phNum: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
    },
    nuRides: {
      type: Number,
      default: 0,
    },
    nuPickups: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifications: {
      type: [notiSchema],
    },
  },
  {
    strict: "true",
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;
