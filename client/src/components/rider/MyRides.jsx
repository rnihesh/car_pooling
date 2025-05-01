import React, { useContext, useState, useEffect } from "react";
import { userContextObj } from "../contexts/UserContext";
import { getBaseUrl } from "../../utils/config";
import axios from "axios";
import "./MyRides.css";

function MyRides() {
  const { currentUser } = useContext(userContextObj);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchRidesUser() {
    try {
      setLoading(true);
      setError(null);

      // The backend expects the baseID as a URL parameter, not a query parameter
      const baseID = currentUser.baseID;
      const res = await axios.get(
        `${getBaseUrl()}/user/specific-rides/${baseID}`
      );

      console.log("my rides:", res.data.payload);
      setRides(res.data.payload);
    } catch (err) {
      console.error("Error fetching rides:", err);
      setError(err.response?.data?.message || "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRide(id) {
    const res = await axios.put(`${getBaseUrl()}/user/ridesdel/${id}`);
    console.log(res);
    fetchRidesUser();
  }
  async function handleRestoreRide(id) {
    const res = await axios.put(`${getBaseUrl()}/user/ridesres/${id}`);
    console.log(res);
    fetchRidesUser();
  }

  // Optional: Fetch rides automatically when component mounts
  useEffect(() => {
    if (currentUser?.baseID) {
      fetchRidesUser();
    }
  }, [currentUser]);

  return (
    <div className="my-rides-container">
      <h2>My Rides</h2>

      {/* Status indicators */}
      {loading && <p>Loading your rides...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {/* Fetch button (optional if using useEffect) */}
      <button
        onClick={fetchRidesUser}
        disabled={loading}
        className="fetch-button "
      >
        {loading ? "Fetching..." : "Refresh Rides"}
      </button>

      {/* Display rides */}
      {rides && rides.length > 0 ? (
        <div className="rides-list">
          {rides.map((rideDoc) => (
            <div key={rideDoc._id} className="ride-document">
              <h3>Rider: {rideDoc.userData.name}</h3>

              {rideDoc.ride &&
                rideDoc.ride.map((singleRide) => (
                  <div key={singleRide._id} className="ride-card">
                    <div className="nameAndDelete">
                      <p>Ride ID: {singleRide.rideId}</p>
                      {singleRide.isRideActive === true ? (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteRide(singleRide._id)}
                        >
                          Delete Ride
                        </button>
                      ) : (
                        <button
                          className="delete-button"
                          onClick={() => handleRestoreRide(singleRide._id)}
                        >
                          Restore Ride
                        </button>
                      )}
                    </div>
                    <p>Vehicle: {singleRide.typeOfVeh}</p>
                    <p>Available Seats: {singleRide.nuSeats}</p>
                    <p>Time: {new Date(singleRide.time).toLocaleString()}</p>
                    <p>
                      Status: {singleRide.isRideActive ? "Active" : "Inactive"}
                    </p>

                    {singleRide.requests && singleRide.requests.length > 0 && (
                      <div className="requests-container">
                        <h4>Requests ({singleRide.requests.length})</h4>
                        <ul className="requests-list">
                          {singleRide.requests.map((request, index) => (
                            <li key={index}>
                              {request.name} -{" "}
                              {request.request
                                ? "Accepted"
                                : request.decline
                                ? "Declined"
                                : "Pending"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No rides found.</p>
      )}
    </div>
  );
}

export default MyRides;
