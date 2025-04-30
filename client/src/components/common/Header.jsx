import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import "./Header.css";
import { userContextObj } from "../contexts/UserContext";

function Header() {
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  // console.log(user);
  const { currentUser, setCurrentUser } = useContext(userContextObj);
  const navigate = useNavigate();
  const location = useLocation();
  console.log("currentUser from header: ",currentUser)

  async function handleSignout() {
    await signOut();
    localStorage.removeItem("currentuser");
    localStorage.clear();
    setCurrentUser(null);
    navigate("/");
  }
  

  return (
    <nav className="d-flex justify-content-between align-items-center p-2 shadow-sm bg-light flex-wrap">
      <div className="fw-bold fs-4">
        <Link to="/" className="text-decoration-none text-dark">
          Ride Share
        </Link>
      </div>

      <div>
        <ul className="navbar-nav d-flex flex-row align-items-center list-unstyled gap-3 m-0">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              About
            </Link>
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

                    {currentUser.role==="" &&(<li className="container-fluid">
                      Choose the role
                      <hr className="dropdown-divider" />
                    </li>)}
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
