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
      const baseID = currentUser.baseID;
      const res = await axios.get(
        `${getBaseUrl()}/user/specific-rides/${baseID}`
      );
      setRides(res.data.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRide(id) {
    await axios.put(`${getBaseUrl()}/user/ridesdel/${id}`);
    fetchRidesUser();
  }
  async function handleRestoreRide(id) {
    await axios.put(`${getBaseUrl()}/user/ridesres/${id}`);
    fetchRidesUser();
  }

  useEffect(() => {
    if (currentUser?.baseID) {
      fetchRidesUser();
    }
  }, [currentUser]);

  return (
    <div className="my-rides-container">
      <h2 className="mb-4" style={{ color: "#e85f5c" }}>
        My Rides
      </h2>
      {loading && <p>Loading your rides...</p>}
      {error && <p className="error-message">Error: {error}</p>}
      <button
        onClick={fetchRidesUser}
        disabled={loading}
        className="fetch-button mb-3"
      >
        {loading ? "Fetching..." : "Refresh Rides"}
      </button>
      {rides && rides.length > 0 ? (
        <div className="rides-list">
          {rides.map((rideDoc) => (
            <div
              key={rideDoc._id}
              className="ride-document card shadow-sm mb-3"
            >
              <div className="card-body">
                <h5 className="card-title mb-3" style={{ color: "#e85f5c" }}>
                  Rider: {rideDoc.userData.name}
                </h5>
                {rideDoc.ride &&
                  rideDoc.ride.map((singleRide) => (
                    <div
                      key={singleRide._id}
                      className="ride-card mb-4 p-3 rounded"
                      style={{ background: "#f8fafc" }}
                    >
                      <div className="nameAndDelete mb-2">
                        <span>
                          <strong>Ride ID:</strong> {singleRide.rideId}
                        </span>
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
                      <div className="mb-1">
                        <strong>Vehicle:</strong> {singleRide.typeOfVeh}
                      </div>
                      <div className="mb-1">
                        <strong>Available Seats:</strong> {singleRide.nuSeats}
                      </div>
                      <div className="mb-1">
                        <strong>Time:</strong>{" "}
                        {new Date(singleRide.time).toLocaleString()}
                      </div>
                      <div className="mb-1">
                        <strong>Status:</strong>{" "}
                        <span
                          className={
                            singleRide.isRideActive
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {singleRide.isRideActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {singleRide.requests &&
                        singleRide.requests.length > 0 && (
                          <div className="requests-container mt-2">
                            <h6>Requests ({singleRide.requests.length})</h6>
                            <ul className="requests-list">
                              {singleRide.requests.map((request, index) => (
                                <li key={index}>
                                  {request.name} -{" "}
                                  {request.request ? (
                                    <span className="text-success">
                                      Accepted
                                    </span>
                                  ) : request.decline ? (
                                    <span className="text-danger">
                                      Declined
                                    </span>
                                  ) : (
                                    <span className="text-warning">
                                      Pending
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <div className="alert alert-info mt-4">No rides found.</div>
      )}
    </div>
  );
}

export default MyRides;
