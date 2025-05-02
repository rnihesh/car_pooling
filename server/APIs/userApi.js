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
    // console.log("ride to update", rideToUpdate);

    // console.log(rideDoc);
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
                coordinates: [longitude, latitude],
              },
              $maxDistance: maxDistance,
            },
          },
        }).select("_id");

        const docIds = geoMatchingDocs.map((doc) => doc._id);
        console.log(`Found ${docIds.length} documents matching geo criteria`);

        // Then fetch the full documents and process them manually
        if (docIds.length > 0) {
          const fullDocs = await Rides.find({
            _id: { $in: docIds },
            "ride.isRideActive": true,
          });

          console.log(`Found ${fullDocs.length} documents with active rides`);

          // Process the documents to match the expected structure
          const processedResults = fullDocs.map((doc) => {
            return {
              _id: doc._id,
              userData: doc.userData,
              rides: doc.ride.filter((r) => r.isRideActive),
            };
          });

          console.log(
            `Processed ${processedResults.length} results with fallback approach`
          );

          // Use these results if the main aggregation failed
          if (processedResults.length > 0) {
            return res.status(200).send({
              message: `nearby rides by ${locType} (fallback method)`,
              payload: processedResults,
            });
          }
        }
      }

      // Send the results from the main aggregation
      res.status(200).send({
        message: `nearby rides by ${locType}`,
        payload: results,
      });
    } catch (error) {
      console.error("Error in /rides/near:", error);
      res.status(500).send({
        message: "Error finding nearby rides",
        error: error.message,
      });
    }
  })
);

//soft delete
userApp.put(
  "/ridesdel/:rideId",
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

//soft restore
userApp.put(
  "/ridesres/:rideId",
  expressAsyncHandler(async (req, res) => {
    const { rideId } = req.params;
    const result = await Rides.findOneAndUpdate(
      { "ride._id": rideId },
      { $set: { "ride.$.isRideActive": true } },
      { new: true } // Returns updated document
    );

    if (!result) {
      return res.status(404).send({ message: "Ride not found" });
    }

    res.status(200).send({ message: "Ride soft restored", payload: result });
  })
);

/// Get notifications
userApp.get(
  "/noti",
  expressAsyncHandler(async (req, res) => {
    try {
      // Fix: Get baseID from query params instead of body
      const id = req.query.baseID;

      console.log("Getting notifications for user ID:", id);

      if (!id) {
        return res.status(400).send({ message: "User ID is required" });
      }

      const notiRes = await User.findById(id);

      if (!notiRes) {
        return res.status(404).send({ message: "User not found" });
      }

      console.log(
        "Found user notifications:",
        notiRes.notifications?.length || 0
      );

      res.status(200).send({
        message: "notifications",
        payload: notiRes.notifications || [],
      });
    } catch (err) {
      console.error("Error getting notifications:", err);
      res.status(500).send({ message: err.message });
    }
  })
);

// Create/Add notification
userApp.put(
  "/notiput",
  expressAsyncHandler(async (req, res) => {
    try {
      const {
        baseID,
        firstName,
        rideId,
        start,
        end,
        role,
        message,
        requesterId,
      } = req.body;

      console.log("Adding notification:", req.body);

      if (!baseID) {
        return res.status(400).send({ message: "User ID is required" });
      }

      // Create notification object
      const newNotification = {
        firstName,
        rideId,
        start,
        end,
        role,
        requesterId: requesterId || "",
        message:
          message ||
          `${firstName} has requested a ride from ${start} to ${end}`,
      };
      console.log("newnoti: ", newNotification);
      // Add notification to user's notifications array
      const updatedUser = await User.findByIdAndUpdate(
        baseID,
        { $push: { notifications: newNotification } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send({ message: "User not found" });
      }

      console.log("Notification added successfully to user:", updatedUser._id);

      res.status(200).send({
        message: "Notification added successfully",
        payload: updatedUser.notifications,
      });
    } catch (err) {
      console.error("Error adding notification:", err);
      res.status(500).send({ message: err.message });
    }
  })
);

// Update notification status (accept/decline)
userApp.put(
  "/updateNotification",
  expressAsyncHandler(async (req, res) => {
    try {
      const { baseID, notificationId, accept, decline, requesterId } = req.body;

      console.log("Updating notification:", req.body);

      // Find the user
      const user = await User.findById(baseID);
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Find the notification
      console.log(user);
      const notification = user.notifications.id(notificationId);
      console.log(notification);
      if (!notification) {
        return res.status(404).send({ message: "Notification not found" });
      }

      // Update the ride request status in Rides collection
      if (notification.role === "user") {
        console.log("Updating ride request status for rider notification");
        const ride = await Rides.findOne({
          "ride.rideId": notification.rideId,
        });

        if (ride) {
          const rideIndex = ride.ride.findIndex(
            (r) => r.rideId === notification.rideId
          );

          if (rideIndex !== -1) {
            const requestIndex = ride.ride[rideIndex].requests.findIndex(
              (req) =>
                req.baseID === requesterId ||
                req.name === notification.firstName
            );

            if (requestIndex !== -1) {
              console.log("Found ride request, updating status");
              // Update request status
              ride.ride[rideIndex].requests[requestIndex].request = accept;
              ride.ride[rideIndex].requests[requestIndex].decline = decline;

              await ride.save();

              // Update notification message
              notification.message = accept
                ? "Request accepted"
                : "Request declined";
              notification.accepted = accept ? true : false;
              notification.declined = accept ? false : true;

              await user.save();
            } else {
              console.log(
                "Request not found in ride. Available requests:",
                ride.ride[rideIndex].requests.map((r) => ({
                  name: r.name,
                  baseID: r.baseID,
                }))
              );
            }
          } else {
            console.log(
              "Ride not found in rides collection. Available rides:",
              ride.ride.map((r) => r.rideId)
            );
          }
        } else {
          console.log("No ride found with rideId:", notification.rideId);
        }
      }

      // Create notification for the requester
      if (requesterId) {
        console.log(
          "Creating response notification for requester:",
          requesterId
        );
        const requester = await User.findById(requesterId);

        if (requester) {
          const responseNotification = {
            firstName: user.firstName,
            rideId: notification.rideId,
            start: notification.start,
            end: notification.end,
            role: "user",
            message: accept
              ? "Your ride request has been accepted"
              : "Your ride request has been declined",
            requesterId: requesterId,
            accepted: accept ? true : false,
            declined: accept ? false : true,
          };

          requester.notifications.push(responseNotification);
          await requester.save();
          console.log("Response notification added to requester");
        } else {
          console.log("Requester not found:", requesterId);
        }
      }

      res.status(200).send({
        message: "Notification updated successfully",
        payload: user.notifications,
      });
    } catch (err) {
      console.error("Error updating notification:", err);
      res.status(500).send({ message: err.message });
    }
  })
);

// Delete notification
userApp.delete(
  "/deleteNotification/:userId/:notificationId",
  expressAsyncHandler(async (req, res) => {
    try {
      const { userId, notificationId } = req.params;

      console.log(
        "Deleting notification:",
        notificationId,
        "for user:",
        userId
      );

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { notifications: { _id: notificationId } } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).send({ message: "User not found" });
      }

      console.log("Notification deleted successfully");

      res.status(200).send({
        message: "Notification deleted successfully",
        payload: updatedUser.notifications,
      });
    } catch (err) {
      console.error("Error deleting notification:", err);
      res.status(500).send({ message: err.message });
    }
  })
);

//fetch a specific user's rides
userApp.get(
  "/specific-rides/:baseID",
  expressAsyncHandler(async (req, res) => {
    try {
      const { baseID } = req.params;
      console.log("Searching rides with baseID:", baseID);

      // Correct query: search for userData.baseID instead of baseID
      const rides = await Rides.find({ "userData.baseID": baseID });

      console.log(`Found ${rides.length} rides for user ${baseID}`);

      if (rides && rides.length > 0) {
        res.status(200).send({
          message: "user rides",
          payload: rides,
          count: rides.length,
        });
      } else {
        res.status(404).send({
          message: "No rides found for this user",
          baseID: baseID,
        });
      }
    } catch (error) {
      console.error("Error fetching specific rides:", error);
      res.status(500).send({
        message: "Error retrieving rides",
        error: error.message,
      });
    }
  })
);

// Add or update a user's vehicle registration number (regNums array)
userApp.put(
  "/updateRegNum",
  expressAsyncHandler(async (req, res) => {
    const { userId, regisNum, name } = req.body;
    if (!userId || !regisNum || !name) {
      return res
        .status(400)
        .send({ message: "userId, regisNum, and name are required" });
    }
    // Upsert: if regisNum exists, update name; else, add new
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    let updated = false;
    if (!user.regNums) user.regNums = [];
    for (let veh of user.regNums) {
      if (veh.regisNum === regisNum) {
        veh.name = name;
        updated = true;
        break;
      }
    }
    if (!updated) {
      user.regNums.push({ regisNum, name });
    }
    await user.save();
    res.status(200).send({ message: "Registration updated", payload: user });
  })
);

module.exports = userApp;
