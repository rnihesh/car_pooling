import React, { useContext, useEffect, useState } from "react";
import { userContextObj } from "../contexts/UserContext";
import { getBaseUrl } from "../../utils/config";
import axios from "axios";
import { Link, useLocation, Outlet } from "react-router-dom";

function UserProfile() {
  const { currentUser, setCurrentUser } = useContext(userContextObj);
  const [editMode, setEditMode] = useState(false);
  const [regNum, setRegNum] = useState("");
  const [vehName, setVehName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const location = useLocation();

  // Fetch latest user info from backend
  useEffect(() => {
    async function fetchUser() {
      if (!currentUser?.baseID) return;
      try {
        const res = await axios.get(`${getBaseUrl()}/user/find`, {
          params: { email: currentUser.email },
        });
        if (res.data && res.data.payload) {
          setUserData(res.data.payload);
        }
      } catch (err) {
        setMessage("Failed to fetch user info.");
      }
    }
    fetchUser();
  }, [currentUser, refresh]);

  // Handle regNum add/update
  async function handleRegNumSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await axios.put(`${getBaseUrl()}/user/updateRegNum`, {
        userId: currentUser.baseID,
        regisNum: regNum,
        name: vehName,
      });
      setMessage("Vehicle registration added/updated!");
      setEditMode(false);
      setRegNum("");
      setVehName("");
      setRefresh((r) => !r);
    } catch (err) {
      setMessage("Failed to update registration number.");
    } finally {
      setSaving(false);
    }
  }

  if (!userData) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  // Navigation options for children
  const isRider = userData.role === "rider";
  const isUser = userData.role === "user";
  const basePath = isRider
    ? `/rider/${userData.email}`
    : `/user/${userData.email}`;

  // Determine if we are at the base profile route or a child route
  const atProfileRoot =
    (isRider &&
      (location.pathname === basePath ||
        location.pathname === `${basePath}/`)) ||
    (isUser &&
      (location.pathname === basePath || location.pathname === `${basePath}/`));

  return (
    <div className="container py-4" style={{ maxWidth: "90%" }}>
      <div className="card shadow p-4 mb-4">
        <div className="d-flex align-items-center mb-3">
          <img
            src={userData.profileImageUrl}
            alt="Profile"
            width={80}
            height={80}
            className="rounded-circle border"
            style={{ objectFit: "cover", marginRight: 24 }}
          />
          <div>
            <h4 className="mb-1" style={{ color: "#e85f5c" }}>
              {userData.firstName} {userData.lastName}
            </h4>
            <span className="badge bg-secondary me-2">
              {userData.role?.toUpperCase()}
            </span>
            <span className="badge bg-light text-dark border">
              {userData.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="mb-2">
          <strong>Email:</strong> {userData.email}
        </div>
        <div className="mb-2">
          <strong>Phone:</strong> {userData.phNum}
        </div>
        <div className="mb-2">
          <strong>Rides:</strong> {userData.nuRides || 0}
          <span className="ms-3">
            <strong>Pickups:</strong> {userData.nuPickups || 0}
          </span>
        </div>
        <div className="mb-2">
          <strong>Vehicle Registrations:</strong>
          <ul className="list-unstyled ms-2 mb-1">
            {userData.regNums && userData.regNums.length > 0 ? (
              userData.regNums.map((veh, idx) => (
                <li key={idx}>
                  <span className="badge bg-info text-dark me-2">
                    {veh.regisNum}
                  </span>
                  <span className="text-muted">{veh.name}</span>
                </li>
              ))
            ) : (
              <li className="text-muted">No vehicles added</li>
            )}
          </ul>
          {editMode ? (
            <form
              className="d-flex flex-wrap gap-2 align-items-center"
              onSubmit={handleRegNumSave}
            >
              <input
                type="text"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                className="form-control"
                style={{ width: 140, maxWidth: "100%" }}
                placeholder="Reg. number"
                required
                maxLength={20}
              />
              <input
                type="text"
                value={vehName}
                onChange={(e) => setVehName(e.target.value)}
                className="form-control"
                style={{ width: 140, maxWidth: "100%" }}
                placeholder="Vehicle name"
                required
                maxLength={30}
              />
              <button
                type="submit"
                className="btn btn-sm btn-success"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setEditMode(false);
                  setRegNum("");
                  setVehName("");
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              className="btn btn-sm btn-outline-primary ms-2"
              onClick={() => setEditMode(true)}
            >
              Add Vehicle
            </button>
          )}
        </div>
        {message && (
          <div className="alert alert-info mt-3 py-2 px-3">{message}</div>
        )}
      </div>
      {/* Navigation for children */}
      <div className="mb-3 d-flex gap-3">
        {isRider && (
          <>
            <Link
              to={`/rider/${userData.email}/my`}
              className={`btn btn-outline-dark${
                location.pathname.endsWith("/my") ? " active" : ""
              }`}
            >
              My Rides
            </Link>
            <Link
              to={`/rider/${userData.email}/ride`}
              className={`btn btn-outline-dark${
                location.pathname.endsWith("/ride") ? " active" : ""
              }`}
            >
              Create Ride
            </Link>
          </>
        )}
        {isUser && (
          <>
            <Link
              to={`/user/${userData.email}/rides`}
              className={`btn btn-outline-dark${
                location.pathname.endsWith("/rides") ? " active" : ""
              }`}
            >
              My Bookings
            </Link>
            <Link
              to={`/user/${userData.email}/current`}
              className={`btn btn-outline-dark${
                location.pathname.endsWith("/current") ? " active" : ""
              }`}
            >
              Current Booking
            </Link>
          </>
        )}
      </div>
      {/* Render child route if not at profile root */}
      {!atProfileRoot && (
        <div className="mt-4">
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default UserProfile;
