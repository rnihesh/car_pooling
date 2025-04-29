const exp = require("express");
const userApp = exp.Router();

const expressAsyncHandler = require("express-async-handler");
const createUser = require("./createUser.js");

const User = require("../models/user.model.js");
const Rides = require("../models/ride.model.js");
require("dotenv").config();

//creating user
userApp.post("/user", expressAsyncHandler(createUser));

userApp.get(
  "/find",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.query;
    const userInDb = await User.findOne({ email: email });
    if (userInDb !== null) {
      res.status(200).send({ message: true, payload: userInDb });
    } else {
      res.status(200).send({ message: false });
    }
  })
);

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

    rideToUpdate.nuSeats -= 1;
    rideToUpdate.requests.push({
      name: user.firstName,
      phNum: user.phNum,
      profileImageUrl: user.profileImageUrl || "",
    });
    console.log("ride to update", rideToUpdate);

    console.log(rideDoc);
    await rideDoc.save();

    await User.findByIdAndUpdate(userId, { $inc: { nuRides: 1 } });

    res.status(200).json({ message: "Request sent successfully" });
  })
);

//rides which are near using geo
userApp.get(
  "/rides/near",
  expressAsyncHandler(async (req, res) => {
    const { lng, lat, maxDistKm = 100, locType = "start" } = req.query;
    
    if (!lng || !lat) {
      return res.status(400).send({ message: "please provide ?lng&lat" });
    }
    
    // Parse coordinates to floats
    const longitude = parseFloat(lng);
    const latitude = parseFloat(lat);
    
    if (isNaN(longitude) || isNaN(latitude)) {
      return res.status(400).send({ message: "Invalid coordinate values" });
    }
    
    const geoField = locType === "start" ? "ride.start" : "ride.end";
    const maxDistance = Number(maxDistKm) * 1000;
    
    try {
      // Fixed aggregation pipeline
      const results = await Rides.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            distanceField: "distance", // Note: Changed from ride.distance
            key: geoField,
            maxDistance,
            spherical: true,
          },
        },
        // Unwind the ride array to work with individual rides
        { $unwind: "$ride" },
        // Filter to only include active rides
        { $match: { "ride.isRideActive": true } },
        // Sort by time
        { $sort: { "ride.time": 1 } },
        // Group back by original document ID
        {
          $group: {
            _id: "$_id",
            userData: { $first: "$userData" },
            rides: { $push: "$ride" }, // Collect rides into an array
          },
        },
      ]);
      
      console.log(`Fixed aggregation found ${results.length} documents`);
      
      // If we still don't have results, try a fallback approach
      if (results.length === 0) {
        console.log("Trying fallback approach...");
        
        // First get the IDs of documents that match our geo criteria
        const geoMatchingDocs = await Rides.find({
          [`ride.${locType === "start" ? "start" : "end"}`]: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              $maxDistance: maxDistance
            }
          }
        }).select('_id');
        
        const docIds = geoMatchingDocs.map(doc => doc._id);
        console.log(`Found ${docIds.length} documents matching geo criteria`);
        
        // Then fetch the full documents and process them manually
        if (docIds.length > 0) {
          const fullDocs = await Rides.find({
            _id: { $in: docIds },
            "ride.isRideActive": true
          });
          
          console.log(`Found ${fullDocs.length} documents with active rides`);
          
          // Process the documents to match the expected structure
          const processedResults = fullDocs.map(doc => {
            return {
              _id: doc._id,
              userData: doc.userData,
              rides: doc.ride.filter(r => r.isRideActive)
            };
          });
          
          console.log(`Processed ${processedResults.length} results with fallback approach`);
          
          // Use these results if the main aggregation failed
          if (processedResults.length > 0) {
            return res.status(200).send({
              message: `nearby rides by ${locType} (fallback method)`,
              payload: processedResults
            });
          }
        }
      }
      
      // Send the results from the main aggregation
      res.status(200).send({
        message: `nearby rides by ${locType}`,
        payload: results
      });
    } catch (error) {
      console.error("Error in /rides/near:", error);
      res.status(500).send({
        message: "Error finding nearby rides",
        error: error.message
      });
    }
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
