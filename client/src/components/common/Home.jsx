import React, { useContext, useEffect, useState } from "react";
import "./Home.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Squares from "../../components/ui/Squares/Squares";
import DecryptedText from "../../components/ui/DecryptedText/DecryptedText";
import { userContextObj } from "../contexts/userContext";
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
  const navigate = useNavigate();
  // Initialize context from Clerk user
  useEffect(() => {
    if (isLoaded && user) {
      setCurrentUser((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        profileImageUrl: user.imageUrl,
        role: prev.role, // carry over whatever role was
        baseID: prev.baseID, // carry ID too
        // …and any other custom fields…
      }));
    }
  }, [isLoaded, user]);
  useEffect(() => {
    console.log("currentUser updated: ", currentUser);
  }, [currentUser]);

  // 1) Helper: returns true if user exists (and sets baseID in context)
  async function checkUserExists(email) {
    try {
      const res = await axios.get(`${getBaseUrl()}/user/find`, {
        params: { email },
      });
      const exists = res.data.message === true;
      if (exists) {
        // grab the Mongo _id and stash it
        const id = res.data.payload._id;
        setCurrentUser((prev) => ({ ...prev, baseID: id }));
      }
      return exists;
    } catch (err) {
      console.error("checkUserExists error:", err);
      return false;
    }
  }

  // 2) onSelectRole: uses that helper
  async function onSelectRole(e) {
    setError("");
    const selectedRole = e.target.value;

    // Update role in context
    setCurrentUser((prev) => ({ ...prev, role: selectedRole }));

    // See if the user is already in your DB
    const exists = await checkUserExists(currentUser.email);
    console.log("exists:", exists);

    if (!exists) {
      // New user → need phone first
      if (!currentUser.phNum) {
        setShowPhoneModal(true);
        return;
      }
      // then create in DB
      await createAndSave({ ...currentUser, role: selectedRole });
    } else {
      // Existing user → carry baseID + role through
      finalizeLogin({ ...currentUser, role: selectedRole });
    }
  }

  // actually POST to create
  async function createAndSave(userObj) {
    try {
      const res = await axios.post(`${getBaseUrl()}/user/user`, userObj);
      const { message, payload } = res.data;
      if (message === userObj.firstName) {
        const merged = { ...userObj, ...payload };
        finalizeLogin(merged);
      } else {
        setError(message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setShowPhoneModal(false);
    }
  }

  // save to context, localStorage & navigate
  function finalizeLogin(userObj) {
    setCurrentUser(userObj);
    console.log("userObj from finalizeLogin : ", userObj);
    localStorage.setItem("currentuser", JSON.stringify(userObj));
    if (userObj.role === "user") {
      navigate(`user/${userObj.email}`);
    } else {
      navigate(`rider/${userObj.email}`);
    }
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

  if (!isLoaded) return null;
  return (
    <div className="container-fluid px-3">
      {!isSignedIn && (
        <>
          <h1
            className="bg-light p-5 text-center rounded-4 my-5 mx-3 mb-5"
            style={{ fontFamily: "Cal Sans" }}
          >
            Modus Operandi
          </h1>
          <div
            className="container-fluid"
            style={{
              fontFamily: "Coral Pixels",
              paddingLeft: "100px",
              paddingRight: "100px",
            }}
          >
            <DecryptedText
              text="Share rides."
              speed={100}
              maxIterations={20}
              characters="ABCD1234!?"
              className="revealed text-center decrypting"
              parentClassName="all-letters"
              encryptedClassName="encrypted"
            />
            <br />
            <DecryptedText
              text="Find drivers, save money."
              speed={100}
              maxIterations={20}
              characters="ABCD1234!?"
              className="revealed text-center decrypting"
              parentClassName="all-letters"
              encryptedClassName="encrypted"
            />
            <br />
            <DecryptedText
              text="Connect with riders, book easy rides."
              speed={100}
              maxIterations={20}
              characters="ABCD1234!?"
              className="revealed text-center decrypting"
              parentClassName="all-letters"
              encryptedClassName="encrypted"
            />
            <br />
            <DecryptedText
              text="Join our car pooling app to travel smarter, cheaper, and greener every day."
              speed={100}
              maxIterations={20}
              characters="ABCD1234!?"
              className="revealed text-center decrypting"
              parentClassName="all-letters"
              encryptedClassName="encrypted"
            />
            <br />
          </div>
        </>
      )}

      {isSignedIn && (
        <div className="d-flex justify-content-center vov">
          <div
            className="user-section p-5 rounded-5 w-100 border"
            style={{ margin: "100px" }}
          >
            <div className="user-info2 d-flex flex-column flex-md-row justify-content-center align-items-center p-4 rounded-3 mb-4">
              <img
                src={user.imageUrl}
                width="100px"
                height="100px"
                className="rounded-circle mb-3 mb-md-0"
                alt="User Profile"
              />
              <div className="user-details text-center text-md-start ms-md-4">
                <h5>
                  Welcome "
                  <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
                    {user.firstName}
                  </span>
                  " !!!
                </h5>
                <p>{user.emailAddresses[0].emailAddress}</p>
              </div>
            </div>

            <div className="role-selection text-center">
              <p className="lead">Select your role</p>
              {error && (
                <p className="text-danger fs-5 font-monospace">{error}</p>
              )}
              <div className="role-buttons d-flex flex-column flex-md-row justify-content-center gap-4">
                {["rider", "user"].map((r) => (
                  <button
                    key={r}
                    className="role-btn d-flex flex-column align-items-center p-4 btn btn-outline-dark"
                    value={r}
                    onClick={onSelectRole}
                  >
                    <img
                      alt={`${r} icon`}
                      className="mb-2"
                      width="100px"
                      src={r === "rider" ? rider : userIcon}
                    />
                    <span style={{ fontWeight: "bolder" }}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </span>
                    <span
                      className="text-sm text-gray-500"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {r === "rider" ? "Offer a ride" : "Find & join rides"}
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
        <div className="modal-dialog pt-5 py-5" role="document">
          <form className="modal-content" onSubmit={handlePhoneSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Enter Your Phone</h5>
            </div>
            <div className="modal-body">
              <input
                type="tel"
                className="form-control"
                placeholder="10-15 digit phone number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPhoneModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-outline-primary">
                Continue
              </button>
            </div>
          </form>
          {error && (
            <p
              className="text-danger text-center fs-5 font-monospace"
              style={{ marginTop: "100px" }}
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
