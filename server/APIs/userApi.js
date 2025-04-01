const exp = require("express");
const userApp = exp.Router();

const expressAsyncHandler = require("express-async-handler");
const createUser = require("./createUser.js");

const User = require("../models/user.model.js");
const Rides = require("../models/ride.model.js");
require("dotenv").config();

//creating user
userApp.post("/user", expressAsyncHandler(createUser));

//creating ride
userApp.post(
  "/riding",
  expressAsyncHandler(async (req, res) => {
    const { userData, ride, nuRides, nuPickups } = req.body;

    const result = await Rides.findOneAndUpdate(
      { "userData.name": userData.name },
      { 
        $setOnInsert: { userData }, 
        $push: { ride }, 
      },
      { new: true, upsert: true } 
    );

    res.status(201).send({ message: "Ride added successfully", payload: result });
  })
);



//read all rides
userApp.get(
  "/rides",
  expressAsyncHandler(async (req, res) => {
    const listOfRides = await Rides.aggregate([
      {
        $addFields: {
          ride: {
            $filter: {
              input: "$ride",
              as: "r",
              cond: { $eq: ["$$r.isRideActive", true] },
            },
          },
        },
      },
      { $match: { ride: { $ne: [] } } }, // Exclude users with no active rides
    ]);

    res.status(200).send({ message: "rides", payload: listOfRides });
  })
);


//unauthorized
userApp.get("/unauthorized", (req, res) => {
  res.send({ message: "unauthorized request .. ?!" });
});

//soft delete
userApp.put(
  "/rides/:rideId",
  expressAsyncHandler(async (req, res) => {
    const { rideId } = req.params;
    const result = await Rides.findOneAndUpdate(
      { "ride.rideId": rideId },
      { $set: { "ride.$.isRideActive": false } },
      { new: true } // Returns updated document
    );

    if (!result) {
      return res.status(404).send({ message: "Ride not found" });
    }

    res.status(200).send({ message: "Ride soft deleted", payload: result });
  })
);


module.exports = userApp;
