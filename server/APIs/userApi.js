const exp = require("express");
const userApp = exp.Router();

const expressAsyncHandler = require("express-async-handler");
const createUser = require("./createUser.js");

const User = require("../models/user.model.js");
const Rides = require("../models/ride.model.js");
require("dotenv").config();

//creating user
userApp.post("/user", expressAsyncHandler(createUser));

userApp.get("/find", expressAsyncHandler(async (req, res)=>{
  const { email } = req.query;
  const userInDb = await User.findOne({ email: email });
  if (userInDb !== null) {
    res.status(200).send({ message: true, payload: userInDb });
  } else {
    res
      .status(200)
      .send({ message: false});
  }
}))

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

    res
      .status(201)
      .send({ message: "Ride added successfully", payload: result });
  })
);

//read all rides
userApp.get(
  "/rides",
  expressAsyncHandler(async (req, res) => {
    // const listOfRides = await Rides.aggregate([
    //   {
    //     $addFields: {
    //       ride: {
    //         $filter: {
    //           input: "$ride",
    //           as: "r",
    //           cond: { $eq: ["$$r.isRideActive", true] },
    //         },
    //       },
    //     },
    //   },
    //   { $match: { ride: { $ne: [] } } }, // Exclude users with no active rides
    // ]);

    // res.status(200).send({ message: "rides", payload: listOfRides });

    const docs = await Rides.find({ "ride.isRideActive": true }).sort({
      "ride.time": 1,
    }); // uses the compound index
    res.status(200).send({ message: "rides", payload: docs });
  })
);

//unauthorized
userApp.get("/unauthorized", (req, res) => {
  res.send({ message: "unauthorized request .. ?!" });
});

//requesting a ride
userApp.put(
  "/ride/request",
  expressAsyncHandler(async (req, res) => {
    const { userId, rideId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rideDoc = await Rides.findOne({ "ride._id": rideId });
    if (!rideDoc) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const rideToUpdate = rideDoc.ride.find((r) => r._id.toString() === rideId);
    if (!rideToUpdate) {
      return res
        .status(404)
        .json({ message: "Ride not found inside document" });
    }

    if (!rideToUpdate.isRideActive) {
      return res.status(400).json({ message: "Ride is not active" });
    }

    const alreadyRequested = rideToUpdate.requests.some(
      (req) => req.phNum === user.phNum
    );
    if (alreadyRequested) {
      return res
        .status(400)
        .json({ message: "You have already requested this ride" });
    }

    if (rideToUpdate.requests.length >= rideToUpdate.nuSeats) {
      return res.status(400).json({ message: "No seats available" });
    }

    rideToUpdate.requests.push({
      name: user.firstName,
      phNum: user.phNum,
      profileImageUrl: user.profileImageUrl || "",
    });

    await rideDoc.save();

    await User.findByIdAndUpdate(userId, { $inc: { nuRides: 1 } });

    res.status(200).json({ message: "Request sent successfully" });
  })
);

//rides which are near using geo
userApp.post(
  "/rides/near",
  expressAsyncHandler(async (req, res) => {
    const { lng, lat, maxDistKm = 5 } = req.body;
    const maxDistance = Number(maxDistKm) * 1000; // meters

    const results = await Rides.aggregate([
      { $unwind: "$ride" },
      { $match: { "ride.isRideActive": true } },
      { $geoNear: {
          near: { type: "Point", coordinates: [ +lng, +lat ] },
          distanceField: "ride.distance",
          maxDistance,
          spherical: true,
          key: "ride.startLocation"
        }
      },
      { $sort: { "ride.time": 1 } },
      { $group: {
          _id: "$_id",
          userData: { $first: "$userData" },
          rides:   { $push: "$ride" }
        }
      }
    ]);

    res.status(200).send({ message: "nearby rides", payload: results });
  })
);


//soft delete
userApp.put(
  "/rides/:rideId",
  expressAsyncHandler(async (req, res) => {
    const { rideId } = req.params;
    const result = await Rides.findOneAndUpdate(
      { "ride._id": rideId },
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
