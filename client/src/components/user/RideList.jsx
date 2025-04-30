import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { userContextObj } from "../contexts/userContext";
import { getBaseUrl } from "../../utils/config";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icon paths:
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom colored markers
const createColoredIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: markerShadow,
    shadowSize: [41, 41],
  });
};

// Define colored icons for different points
const startIcon = createColoredIcon("green");
const endIcon = createColoredIcon("red");
const currentLocationIcon = createColoredIcon("blue");
const destinationIcon = createColoredIcon("orange");

// For reverse geocoding
async function getLocationName(lat, lng) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    return response.data.display_name || "Unknown location";
  } catch (error) {
    console.error("Error getting location name:", error);
    return "Unknown location";
  }
}

// Component to fit map bounds to all markers
function BoundsUpdater({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, points]);

  return null;
}

function LocationPicker({ setDest }) {
  useMapEvents({
    click(e) {
      setDest({
        type: "Point",
        coordinates: [e.latlng.lng, e.latlng.lat],
      });
    },
  });
  return null;
}

// Ride Card component with hover map
function RideCard({ ride, requestRide, currentLocation }) {
  const [showMap, setShowMap] = useState(false);
  const [startLocationName, setStartLocationName] = useState("Loading...");
  const [endLocationName, setEndLocationName] = useState("Loading...");
  const [hovering, setHovering] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () => {
    // Use timeout to prevent flickering if user just moves mouse through
    hoverTimeout.current = setTimeout(() => {
      setHovering(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setHovering(false);
  };

  useEffect(() => {
    // Fetch location names when the card is rendered
    async function fetchLocationNames() {
      const start = await getLocationName(
        ride.start.coordinates[1],
        ride.start.coordinates[0]
      );
      const end = await getLocationName(
        ride.end.coordinates[1],
        ride.end.coordinates[0]
      );
      setStartLocationName(start);
      setEndLocationName(end);
    }

    fetchLocationNames();
  }, [ride]);

  // Calculate ride distance - straight line for simplicity
  const calculateDistance = () => {
    if (!currentLocation) return null;

    // Function to calculate distance between two points using Haversine formula
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    const startLat = ride.start.coordinates[1];
    const startLng = ride.start.coordinates[0];
    const currLat = currentLocation.coordinates[1];
    const currLng = currentLocation.coordinates[0];

    return getDistanceFromLatLonInKm(
      startLat,
      startLng,
      currLat,
      currLng
    ).toFixed(1);
  };

  // Prepare points for the map
  const mapPoints = currentLocation
    ? [
        [currentLocation.coordinates[1], currentLocation.coordinates[0]],
        [ride.start.coordinates[1], ride.start.coordinates[0]],
        [ride.end.coordinates[1], ride.end.coordinates[0]],
      ]
    : [
        [ride.start.coordinates[1], ride.start.coordinates[0]],
        [ride.end.coordinates[1], ride.end.coordinates[0]],
      ];

  // Get the distance if we have current location
  const distance = calculateDistance();

  return (
    <div
      className="list-group-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5>{ride.userData.name}</h5>
          <p className="mb-1">
            <strong>From:</strong>{" "}
            {startLocationName.split(",").slice(0, 2).join(",")}
          </p>
          <p className="mb-1">
            <strong>To:</strong>{" "}
            {endLocationName.split(",").slice(0, 2).join(",")}
          </p>
          <p className="mb-1">
            <strong>Vehicle:</strong> {ride.typeOfVeh} | <strong>Seats:</strong>{" "}
            {ride.nuSeats}
          </p>
          <p className="mb-0">
            <strong>Time:</strong> {new Date(ride.time).toLocaleString()}
          </p>
          {distance && (
            <p className="mb-0 mt-2 badge bg-info text-dark">
              {distance} km from your location
            </p>
          )}
          <div className="mt-2">
            <button
              className="btn btn-sm btn-secondary me-2"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "Hide Map" : "Show Map"}
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => requestRide(ride)}
            >
              Request Ride
            </button>
          </div>
        </div>

        {/* Hover preview map */}
        {hovering && (
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={[ride.start.coordinates[1], ride.start.coordinates[0]]}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[
                  ride.start.coordinates[1],
                  ride.start.coordinates[0],
                ]}
                icon={startIcon}
              />
              <Marker
                position={[ride.end.coordinates[1], ride.end.coordinates[0]]}
                icon={endIcon}
              />
              <Polyline
                positions={[
                  [ride.start.coordinates[1], ride.start.coordinates[0]],
                  [ride.end.coordinates[1], ride.end.coordinates[0]],
                ]}
                color="blue"
              />
              <BoundsUpdater
                points={[
                  [ride.start.coordinates[1], ride.start.coordinates[0]],
                  [ride.end.coordinates[1], ride.end.coordinates[0]],
                ]}
              />
            </MapContainer>
          </div>
        )}
      </div>

      {/* Full detailed map */}
      {showMap && (
        <div style={{ height: "300px", marginTop: "15px" }}>
          <MapContainer
            center={[ride.start.coordinates[1], ride.start.coordinates[0]]}
            zoom={10}
            style={{ height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Ride start marker */}
            <Marker
              position={[ride.start.coordinates[1], ride.start.coordinates[0]]}
              icon={startIcon}
            >
              <Popup>
                <strong>Start Point</strong>
                <br />
                {startLocationName}
              </Popup>
            </Marker>

            {/* Ride end marker */}
            <Marker
              position={[ride.end.coordinates[1], ride.end.coordinates[0]]}
              icon={endIcon}
            >
              <Popup>
                <strong>End Point</strong>
                <br />
                {endLocationName}
              </Popup>
            </Marker>

            {/* User's current location marker */}
            {currentLocation && (
              <Marker
                position={[
                  currentLocation.coordinates[1],
                  currentLocation.coordinates[0],
                ]}
                icon={currentLocationIcon}
              >
                <Popup>
                  <strong>Your Location</strong>
                </Popup>
              </Marker>
            )}

            {/* Route line */}
            <Polyline
              positions={[
                [ride.start.coordinates[1], ride.start.coordinates[0]],
                [ride.end.coordinates[1], ride.end.coordinates[0]],
              ]}
              color="blue"
            />

            <BoundsUpdater points={mapPoints} />
          </MapContainer>
        </div>
      )}
    </div>
  );
}

export default function RideList() {
  const { currentUser } = useContext(userContextObj);
  const [startLoc, setStartLoc] = useState(null);
  const [dest, setDest] = useState(null);
  const [rides, setRides] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "car", "bike"
  const [sortBy, setSortBy] = useState("time"); // "time", "distance"

  // 1) Get user's current position once:
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStartLoc({
          type: "Point",
          coordinates: [pos.coords.longitude, pos.coords.latitude],
        });
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
      }
    );
  }, []);

  // 2) Whenever startLoc or dest changes, fetch rides:
  useEffect(() => {
    if (!startLoc) return;
    fetchRides();
  }, [startLoc, dest]);

  async function fetchRides() {
    setLoading(true);
    try {
      let res;

      if (dest) {
        console.log("Fetching rides near destination:", dest.coordinates);

        // Fetch nearby rides by end-location
        res = await axios.get(`${getBaseUrl()}/user/rides/near`, {
          params: {
            lng: dest.coordinates[0],
            lat: dest.coordinates[1],
            locType: "end",
            maxDistKm: 5, // Increased from 5 to 15km for more results
          },
        });

        // Handle the response data
        const docs = res.data.payload || [];

        // Process the data
        const flat = docs.flatMap((doc) => {
          const ridesArray = doc.rides || [];

          if (!Array.isArray(ridesArray)) {
            return [];
          }

          return ridesArray.map((r) => ({
            ...r,
            userData: doc.userData || {},
            ...(r.distance ? { distance: r.distance } : {}),
          }));
        });

        // Sort by time by default
        flat.sort((a, b) => new Date(a.time) - new Date(b.time));

        setRides(flat);
      } else {
        // Fetch all active rides
        res = await axios.get(`${getBaseUrl()}/user/rides`);

        const docs = res.data.payload || [];

        const flat = docs.flatMap((doc) =>
          (doc.ride || [])
            .filter((r) => r.isRideActive)
            .map((r) => ({
              ...r,
              userData: doc.userData,
            }))
        );

        setRides(flat);
      }
    } catch (err) {
      console.error("Error fetching rides:", err);
      setMessage("Failed to load rides. Please try again.");
      setRides([]);
    } finally {
      setLoading(false);
    }
  }

  // 3) Send a ride request &
  async function requestRide(ride) {
    try {
      // (a) request the ride
      console.log("from reqride: ", ride);
      const { data: reqRes } = await axios.put(
        `${getBaseUrl()}/user/ride/request`,
        {
          userId: currentUser.baseID,
          rideId: ride._id,
        }
      );
      // show success for ride request
      setMessage(reqRes.message);
      console.log("from after reqride");

      // (b) push a notification to the ride owner
      console.log(
        "for notiput from rewride: ",
        ride.userData.baseID,
        currentUser.firstName,
        ride.rideId,
        ride.start.coordinates,
        currentUser.role,
        currentUser.baseID
        // startLocationName.split(",")[0]
      );
      await axios.put(`${getBaseUrl()}/user/notiput`, {
        baseID: ride.userData.baseID, // the ride-owner’s user id
        firstName: currentUser.firstName, // who’s requesting
        rideId: ride.rideId,
        start: {
          type: "Point",
          coordinates: ride.start.coordinates, // start is [lng, lat]
        }, // [lng, lat]
        end: {
          type: "Point",
          coordinates: ride.end.coordinates, // start is [lng, lat]
        }, // [lng, lat]
        role: currentUser.role || "",
        requesterId: currentUser.baseID,
        // message: `${currentUser.firstName} has requested your ride from ${
        //   startLocationName.split(",")[0] || "start"
        // } to ${endLocationName.split(",")[0] || "end"}`,
        message: `${currentUser.firstName}, from start to end`,
      });

      fetchRides(); // refresh seats/counts if needed
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
    }
  }

  // Filter and sort rides
  const filteredRides = rides
    .filter((ride) => {
      if (filter === "all") return true;
      return ride.typeOfVeh.toLowerCase() === filter;
    })
    .sort((a, b) => {
      if (sortBy === "time") {
        return new Date(a.time) - new Date(b.time);
      } else if (sortBy === "distance" && a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return 0;
    });

  return (
    <div className="container py-4">
      <h2 className="mb-3">Available Rides</h2>

      {/* Map for picking destination */}
      <div style={{ height: "300px" }} className="mb-4 border rounded">
        {startLoc ? (
          <MapContainer
            center={[startLoc.coordinates[1], startLoc.coordinates[0]]}
            zoom={13}
            style={{ height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {/* Start location marker */}
            <Marker
              position={[startLoc.coordinates[1], startLoc.coordinates[0]]}
              icon={currentLocationIcon}
            >
              <Popup>Your current location</Popup>
            </Marker>
            {/* Click to pick End location */}
            <LocationPicker setDest={setDest} />
            {dest && (
              <Marker
                position={[dest.coordinates[1], dest.coordinates[0]]}
                icon={destinationIcon}
              >
                <Popup>Your selected destination</Popup>
              </Marker>
            )}
          </MapContainer>
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and sort controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          {dest ? (
            <p className="mb-0">
              Showing rides near your selected destination.
            </p>
          ) : (
            <p className="mb-0">Showing all active rides.</p>
          )}
        </div>

        <div className="d-flex">
          <div className="me-3">
            <label className="me-2">Filter:</label>
            <select
              className="form-select form-select-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Vehicles</option>
              <option value="car">Car Only</option>
              <option value="bike">Bike Only</option>
            </select>
          </div>

          <div>
            <label className="me-2">Sort:</label>
            <select
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="time">By Time</option>
              <option value="distance">By Distance</option>
            </select>
          </div>
        </div>
      </div>

      {message && (
        <div
          className="alert alert-info alert-dismissible fade show"
          role="alert"
        >
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Ride list */}
      <div className="list-group">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading rides...</p>
          </div>
        ) : filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard
              key={ride._id || ride.rideId}
              ride={ride}
              requestRide={requestRide}
              currentLocation={startLoc}
            />
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-muted">No rides found.</p>
            <p>
              Try {dest ? "selecting a different destination or " : ""}
              increasing your search area.
            </p>
            <button className="btn btn-primary" onClick={fetchRides}>
              Refresh Rides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
