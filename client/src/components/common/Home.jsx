import React, { useContext, useEffect, useState } from "react";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Squares from "../../components/ui/Squares/Squares";
import DecryptedText from "../../components/ui/DecryptedText/DecryptedText";
import { userContextObj } from "../contexts/UserContext";
import { getBaseUrl } from "../../utils/config";
import rider from "../../assets/rider.svg";
import userIcon from "../../assets/user.svg";

function Home() {
  const { currentUser, setCurrentUser } = useContext(userContextObj);
  const { isSignedIn, user, isLoaded } = useUser();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // console.log(user)
  // Initialize context from Clerk user
  useEffect(() => {
    if (isLoaded && user) {
      setCurrentUser((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        profileImageUrl: user.imageUrl,
        role: role || "", // carry over whatever role was
        baseID: prev?.baseID || "", // carry ID too
      }));
      setLoading(false);
    }
  }, [isLoaded, user, setCurrentUser]);

  // Log current user when updated
  useEffect(() => {
    // console.log("currentUser updated: ", currentUser);
  }, [currentUser]);

  // Load from localStorage on initial mount
  // useEffect(() => {
  //   const savedUser = localStorage.getItem("currentuser");
  //   if (savedUser) {
  //     try {
  //       const parsedUser = JSON.parse(savedUser);
  //       if (parsedUser.baseID) {
  //         setCurrentUser(prevUser => ({
  //           ...prevUser,
  //           ...parsedUser
  //         }));
  //         console.log("Loaded user from localStorage:", parsedUser);
  //       }
  //     } catch (err) {
  //       console.error("Error parsing saved user:", err);
  //     }
  //   }
  // }, []);

  // 1) Helper: returns true if user exists (and sets baseID in context)
  async function checkUserExists(email) {
    if (!email) return null;
    try {
      const { data } = await axios.get(`${getBaseUrl()}/user/find`, {
        params: { email },
      });
      if (data.message === true && data.payload?._id) {
        return data.payload._id; // return the Mongo _id
      }
      return null;
    } catch (err) {
      console.error("checkUserExists error:", err);
      return null;
    }
  }

  async function onSelectRole(selectedRole) {
    setError("");
    setRole(selectedRole);

    // 1. build your userObj directly from currentUser + the freshly clicked role
    const userObj = {
      ...currentUser,
      role: selectedRole,
      phNum: currentUser.phNum, // if they already entered phone
    };

    if (!userObj.email) {
      setError("User email is missing. Please try logging in again.");
      return;
    }

    // 2. check existence & get baseID
    const existingId = await checkUserExists(userObj.email);
    if (existingId) {
      userObj.baseID = existingId;
      finalizeLogin(userObj);
    } else {
      if (!userObj.phNum) {
        setShowPhoneModal(true);
        return;
      }
      await createAndSave(userObj);
    }
  }

  // actually POST to create
  async function createAndSave(userObj) {
    try {
      // console.log("Creating user with:", userObj);
      const res = await axios.post(`${getBaseUrl()}/user/user`, userObj);
      const { message, payload } = res.data;
      // console.log("Create user response:", res.data);

      if (message === userObj.firstName) {
        const merged = { ...userObj, ...payload };
        finalizeLogin(merged);
      } else {
        setError(message || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setShowPhoneModal(false);
    }
  }

  function finalizeLogin(userObj) {
    if (!userObj.baseID) {
      console.error("Warning: finalizing login with no baseID", userObj);
    }

    if (!userObj.role) {
      setError("Please select a role before continuing.");
      return;
    }

    const safeEmail = encodeURIComponent(userObj.email);
    const path = `/${userObj.role}/${safeEmail}`;
    // console.log("Navigating to:", path);
    setCurrentUser(userObj);
    localStorage.setItem("currentuser", JSON.stringify(userObj));
    navigate(path);
  }

  // when phone modal is submitted
  function handlePhoneSubmit(e) {
    e.preventDefault();
    if (!phoneInput.match(/^\d{7,15}$/)) {
      setError("Please enter a valid phone number");
      return;
    }
    const updated = { ...currentUser, phNum: phoneInput };
    setCurrentUser(updated);
    createAndSave(updated);
  }

  return (
    <div className="container-fluid px-0" style={{ minHeight: "100vh" }}>
      {/* Animated Hero Section */}
      {!isSignedIn && (
        <div className="position-relative" style={{ minHeight: "60vh" }}>
          <Squares
            direction="diagonal"
            speed={0.5}
            borderColor="#e0e0e0"
            squareSize={60}
            hoverFillColor="#e85f5c"
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ zIndex: 0, opacity: 0.15 }}
          />
          <div
            className="d-flex flex-column align-items-center justify-content-center text-center position-relative"
            style={{ zIndex: 1, minHeight: "60vh" }}
          >
            <h1
              className="fw-bold mb-4"
              style={{
                fontFamily: "Cal Sans",
                fontSize: "3rem",
                color: "#222",
              }}
            >
              <span style={{ color: "#e85f5c" }}>Ride Share</span> – Go Greener,
              Go Together!
            </h1>
            <div className="mb-3" style={{ maxWidth: 600 }}>
              <DecryptedText
                text="Share rides. Save money. Reduce pollution."
                speed={60}
                maxIterations={18}
                className="fs-4 text-dark"
                parentClassName="all-letters"
                encryptedClassName="encrypted"
              />
            </div>
            <div className="mb-2" style={{ maxWidth: 700 }}>
              <DecryptedText
                text="Join our car pooling app to travel smarter, cheaper, and greener every day."
                speed={60}
                maxIterations={18}
                className="fs-5 text-secondary"
                parentClassName="all-letters"
                encryptedClassName="encrypted"
              />
            </div>
            <div className="mt-4">
              <a
                href="/signin"
                className="btn btn-lg btn-primary px-5 py-2"
                style={{
                  background: "#e85f5c",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Signed-in User Section */}
      {isSignedIn && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "80vh" }}
        >
          <div
            className="user-section p-4 rounded-5 w-100 border shadow-lg"
            style={{ maxWidth: 700, background: "#fff" }}
          >
            <div
              className="user-info2 d-flex flex-column flex-md-row justify-content-center align-items-center p-4 rounded-3 mb-4"
              style={{ background: "#f8fafc" }}
            >
              <img
                src={user.imageUrl}
                width="110"
                height="110"
                className="rounded-circle mb-3 mb-md-0"
                alt="User Profile"
                style={{
                  boxShadow: "0 2px 12px rgba(232,95,92,0.12)",
                  border: "3px solid var(--gray-200)",
                }}
              />
              <div className="user-details text-center text-md-start ms-md-4">
                <h4 className="fw-bold mb-1" style={{ color: "#e85f5c" }}>
                  Welcome, {user.firstName}!
                </h4>
                <p className="mb-1 text-muted">
                  {user.emailAddresses[0].emailAddress}
                </p>
                {currentUser?.baseID && (
                  <span className="badge bg-secondary">
                    ID: {currentUser.baseID}
                  </span>
                )}
              </div>
            </div>

            <div className="role-selection text-center">
              <p className="lead mb-3">Choose your role to continue</p>
              {error && (
                <p className="text-danger fs-5 font-monospace">{error}</p>
              )}
              <div className="role-buttons d-flex flex-column flex-md-row justify-content-center gap-4">
                {[
                  {
                    key: "rider",
                    title: "Rider",
                    desc: "Offer a ride",
                    icon: rider,
                    color: "#e85f5c",
                  },
                  {
                    key: "user",
                    title: "User",
                    desc: "Find & join rides",
                    icon: userIcon,
                    color: "#667085",
                  },
                ].map((r) => (
                  <button
                    key={r.key}
                    className="role-btn d-flex flex-column align-items-center p-4 btn btn-outline-dark shadow-sm"
                    onClick={() => onSelectRole(r.key)}
                    style={{
                      minWidth: 200,
                      borderColor: role === r.key ? r.color : "#e0e0e0",
                      borderWidth: role === r.key ? 3 : 2,
                      borderRadius: 20,
                      background: role === r.key ? `${r.color}10` : "white",
                      transition: "all 0.3s ease",
                      transform: role === r.key ? "scale(1.02)" : "scale(1)",
                      boxShadow:
                        role === r.key
                          ? `0 8px 25px ${r.color}30`
                          : "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                    onMouseEnter={(e) => {
                      if (role !== r.key) {
                        e.currentTarget.style.borderColor = r.color;
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = `0 6px 20px ${r.color}20`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (role !== r.key) {
                        e.currentTarget.style.borderColor = "#e0e0e0";
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.08)";
                      }
                    }}
                  >
                    <div
                      className="role-icon-wrapper mb-3 p-3 rounded-circle"
                      style={{
                        background: `${r.color}15`,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <img
                        alt={`${r.title} icon`}
                        width="60"
                        height="60"
                        src={r.icon}
                        style={{
                          filter: r.key === "rider" ? "none" : "grayscale(0.5)",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontWeight: "700",
                        color: r.color,
                        fontSize: "1.25rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {r.title}
                    </span>
                    <span
                      className="text-muted mt-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone-collection modal */}
      <div
        className={`modal fade ${showPhoneModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        style={showPhoneModal ? { background: "rgba(248,249,250,0.9)" } : {}}
      >
        <div
          className="modal-dialog pt-5 py-5"
          style={{ marginTop: "100px" }}
          role="document"
        >
          <form className="modal-content" onSubmit={handlePhoneSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Enter Your Phone Number</h5>
            </div>
            <div className="modal-body">
              <input
                type="tel"
                className="form-control"
                placeholder="10-15 digit phone number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
                autoFocus
                pattern="^\d{7,15}$"
              />
              <small className="text-muted">
                We'll use this to contact you about your rides.
              </small>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPhoneModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "#e85f5c", border: "none" }}
              >
                Continue
              </button>
            </div>
          </form>
          {error && (
            <p
              className="text-danger text-center fs-5 font-monospace"
              style={{ marginTop: "20px" }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
