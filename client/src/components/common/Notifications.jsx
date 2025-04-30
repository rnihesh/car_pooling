import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { userContextObj } from "../contexts/UserContext"; // Make sure path is correct
import { getBaseUrl } from "../../utils/config"; // Import getBaseUrl helper
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(userContextObj);

  useEffect(() => {
    // Fetch notifications when component mounts or when currentUser changes
    if (currentUser && currentUser.baseID) {
      "Fetching notifications for user:", currentUser.baseID;
      fetchNotifications();
    } else {
      // console.log("No baseID available in currentUser:", currentUser);
      setLoading(false);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Pass baseID as a query parameter instead of in request body
      const response = await axios.get(
        `${getBaseUrl()}/user/noti?baseID=${currentUser.baseID}`
      );

      // console.log("Notifications response:", response.data);

      if (response.data && response.data.payload) {
        setNotifications(response.data.payload);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    } catch (err) {
      console.error(
        "Error fetching notifications:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to load notifications");
      setLoading(false);
    }
  };

  const handleAccept = async (notification) => {
    try {
      // console.log("Accepting notification:", notification);
      await axios.put(`${getBaseUrl()}/user/updateNotification`, {
        baseID: currentUser.baseID,
        notificationId: notification._id,
        accept: true,
        decline: false,
        requesterId: notification.requesterId || "",
      });

      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error(
        "Error accepting ride request:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to accept request");
    }
  };

  const handleDecline = async (notification) => {
    try {
      // console.log("Declining notification:", notification);
      await axios.put(`${getBaseUrl()}/user/updateNotification`, {
        baseID: currentUser.baseID,
        notificationId: notification._id,
        accept: false,
        decline: true,
        requesterId: notification.requesterId || "",
      });

      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error(
        "Error declining ride request:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to decline request");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      // console.log("Deleting notification:", notificationId);
      await axios.delete(
        `${getBaseUrl()}/user/deleteNotification/${
          currentUser.baseID
        }/${notificationId}`
      );

      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error(
        "Error deleting notification:",
        err.response?.data || err.message
      );
      setError(err.response?.data?.message || "Failed to delete notification");
    }
  };

  // Function to render appropriate action buttons based on notification type
  const renderActionButtons = (notification) => {
    // For rider who needs to accept/decline a ride request
    notification;
    const alreadyHandled =
      notification.message.includes("accepted") ||
      notification.message.includes("declined");
    if (notification.role === "user" && !alreadyHandled) {
      return (
        <div className="notification-actions">
          <button
            className="accept-btn"
            onClick={() => handleAccept(notification)}
          >
            Accept
          </button>
          <button
            className="decline-btn"
            onClick={() => handleDecline(notification)}
          >
            Decline
          </button>
        </div>
      );
    }

    // For all notifications, show delete option
    return (
      <div className="notification-actions">
        <button
          className="delete-btn"
          onClick={() => handleDelete(notification._id)}
        >
          Dismiss
        </button>
      </div>
    );
  };

  // Debug information section
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== "production") {
      return (
        <div className="debug-info bg-light p-3 my-3 rounded small">
          <h6>Debug Info:</h6>
          <p>Current User ID: {currentUser?.baseID || "Not set"}</p>
          <p>Notifications Count: {notifications?.length || 0}</p>
          <button
            className="btn btn-sm btn-secondary"
            onClick={fetchNotifications}
          >
            Refresh Notifications
          </button>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="notifications-loading">Loading notifications...</div>
    );
  }

  if (error) {
    return (
      <div className="notifications-error">
        <p>{error}</p>
        <button onClick={fetchNotifications} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>

      {renderDebugInfo()}

      {!currentUser?.baseID ? (
        <div className="notifications-error">
          <p>User ID not found. Please log in again.</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="no-notifications">You have no notifications</div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification._id} className="notification-item">
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-from">
                    {notification.firstName}
                  </span>
                  <span className="notification-type">{notification.role}</span>
                </div>

                <div className="notification-details">
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-route">
                    {notification.start?.coordinates &&
                      notification.end?.coordinates &&
                      (() => {
                        const [lng1, lat1] = notification.start.coordinates;
                        const [lng2, lat2] = notification.end.coordinates;
                        return (
                          <div className="notification-card">
                            <p className="coords">
                              From: {lat1.toFixed(6)}, {lng1.toFixed(6)}
                              <br />
                              To: {lat2.toFixed(6)}, {lng2.toFixed(6)}
                            </p>
                            <p className="role">Role: {notification.role}</p>
                          </div>
                        );
                      })()}
                  </div>
                  <p className="notification-ride-id">
                    Ride ID: {notification.rideId}
                  </p>
                  {notification.requesterId && (
                    <p className="notification-requester-id small text-muted">
                      Requester ID: {notification.requesterId}
                    </p>
                  )}
                </div>
              </div>

              {renderActionButtons(notification)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
