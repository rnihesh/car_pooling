import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { userContextObj } from "../contexts/userContext";
import { getBaseUrl } from "../../utils/config";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// import "CreateRide.css"

import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Set default marker icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function CreateRide() {
  const [rideData, setRideData] = useState({
    rideId: "",
    typeOfVeh: "",
    nuSeats: "",
    start: {
      type: "Point",
      coordinates: [], // [lon, lat]
    },
    end: {
      type: "Point",
      coordinates: [], // [lon, lat]
    },
    time: "",
  });

  const {currentUser} = useContext(userContextObj);
  // const currentUser = JSON.stringify(localStorage.getItem("currentuser"));
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setRideData({ ...rideData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name: currentUser.firstName,
      profileImageUrl: currentUser.profileImageUrl,
      baseID: currentUser.baseID,
    };

    const ride = [
      {
        rideId: rideData.rideId,
        typeOfVeh: rideData.typeOfVeh,
        nuSeats: Number(rideData.nuSeats),
        start: rideData.start,
        end: rideData.end,
        time: rideData.time,
        isRideActive: true,
      },
    ];
    console.log("userdata from createride: ", userData,  "ride data : ", ride)

    try {
      const res = await axios.post(`${getBaseUrl()}/user/riding`, {
        userData,
        ride,
      });
      
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Failed to add ride.", err);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.longitude, position.coords.latitude];
        setRideData((prev) => ({
          ...prev,
          start: {
            type: "Point",
            coordinates: coords,
          },
        }));
      },
      (err) => console.error("Error getting start location:", err)
    );
  }, []);

  function LocationPicker({ setRideData }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setRideData((prev) => ({
          ...prev,
          end: {
            type: "Point",
            coordinates: [lng, lat],
          },
        }));
      },
    });
    return null;
  }

  return (
    <div className="container p-4">
      <h2 className="mb-3">Create Ride</h2>
      {message && <p className="alert alert-info">{message}</p>}
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <input
          type="text"
          name="rideId"
          placeholder="Ride ID"
          value={rideData.rideId}
          onChange={handleChange}
          className="form-control"
          required
        />
        <select
          name="typeOfVeh"
          value={rideData.typeOfVeh}
          onChange={handleChange}
          className="form-control"
          required
        >
          <option value="">Select Vehicle Type</option>
          <option value="Car">Car</option>
          <option value="Bike">Bike</option>
        </select>

        <input
          type="number"
          name="nuSeats"
          placeholder="Number of Seats"
          value={rideData.nuSeats}
          onChange={handleChange}
          className="form-control"
          required
        />

        <input
          type="text"
          name="start"
          placeholder="Start Location"
          value={
            rideData.start.coordinates.length
              ? `${rideData.start.coordinates[1]}, ${rideData.start.coordinates[0]}`
              : ""
          }
          className="form-control"
          readOnly
        />

        <input
          type="text"
          name="end"
          placeholder="End Location"
          value={
            rideData.end.coordinates.length
              ? `${rideData.end.coordinates[1]}, ${rideData.end.coordinates[0]}`
              : ""
          }
          className="form-control"
          readOnly
        />

        <MapContainer
          center={[17.4933, 78.3915]}
          zoom={13}
          style={{ height: "300px", borderRadius:"10px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <LocationPicker setRideData={setRideData} />
          {rideData.start.coordinates.length > 0 && (
            <Marker
              position={[
                rideData.start.coordinates[1],
                rideData.start.coordinates[0],
              ]}
            />
          )}
          {rideData.end.coordinates.length > 0 && (
            <Marker
              position={[
                rideData.end.coordinates[1],
                rideData.end.coordinates[0],
              ]}
            />
          )}
        </MapContainer>

        <input
          type="datetime-local"
          name="time"
          value={rideData.time}
          onChange={handleChange}
          className="form-control"
          required
        />
        <button type="submit" className="btn btn-primary">
          Submit Ride
        </button>
      </form>
    </div>
  );
}

export default CreateRide;
