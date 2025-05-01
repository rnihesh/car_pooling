import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "./Header.css";
import { userContextObj } from "../contexts/UserContext";

function Header() {
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  const { currentUser, setCurrentUser } = useContext(userContextObj);
  const navigate = useNavigate();

  async function handleSignout() {
    await signOut();
    localStorage.removeItem("currentuser");
    localStorage.clear();
    setCurrentUser(null);
    navigate("/");
  }

  return (
    <nav className="main-navbar d-flex align-items-center p-3 shadow-sm flex-wrap">
      <div className="fw-bold fs-4">
        <Link
          to="/"
          className="text-decoration-none text-dark"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span style={{ color: "#e85f5c" }}>Ride Share</span>
        </Link>
      </div>
      <div>
        <ul className="navbar-nav d-flex flex-row align-items-center list-unstyled gap-3 m-0">
          <li className="nav-item">
            <Link
              to="/"
              className="nav-link"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <a
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
              className="nav-link"
              style={{ cursor: "pointer" }}
            >
              About
            </a>
          </li>
          {!isSignedIn && (
            <>
              <li className="nav-item">
                <Link to="/signin" className="nav-link">
                  Sign In
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link ">
                  Sign Up
                </Link>
              </li>
            </>
          )}
          {isSignedIn && (
            <>
              <li className="nav-item">
                <Link to="/noti" className="nav-link">
                  Notifications
                </Link>
              </li>
            </>
          )}
          {isSignedIn && (
            <>
              <li className="nav-item dropdown">
                <div className="dropdown">
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    width="40"
                    height="40"
                    className="rounded-circle dropdown-toggle"
                    type="button"
                    id="profileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      border: "2px solid #e85f5c",
                      boxShadow: "0 2px 8px rgba(232,95,92,0.08)",
                    }}
                  />
                  <ul
                    className="dropdown-menu dropdown-menu-end mt-3"
                    aria-labelledby="profileDropdown"
                  >
                    {currentUser.role === "user" && (
                      <>
                        <li>
                          <Link
                            className="dropdown-item"
                            to={`user/${user.primaryEmailAddress.emailAddress}/rides`}
                          >
                            Rides
                          </Link>
                        </li>
                        <li>
                          <Link
                            className="dropdown-item"
                            to={`user/${user.primaryEmailAddress.emailAddress}/current`}
                          >
                            Current Booking
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                      </>
                    )}
                    {currentUser.role === "rider" && (
                      <>
                        <li>
                          <Link
                            className="dropdown-item"
                            to={`rider/${user.primaryEmailAddress.emailAddress}/my`}
                          >
                            My Rides
                          </Link>
                        </li>
                        <li>
                          <Link
                            className="dropdown-item"
                            to={`rider/${user.primaryEmailAddress.emailAddress}/ride`}
                          >
                            Create Ride
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                      </>
                    )}
                    {currentUser.role === "" && (
                      <li className="container-fluid">
                        Choose the role
                        <hr className="dropdown-divider" />
                      </li>
                    )}
                    <li>
                      <button onClick={handleSignout} className="dropdown-item">
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Header;
