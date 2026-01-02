import React from "react";
import "./LoadingSpinner.css";

function LoadingSpinner({
  size = "medium",
  color = "primary",
  text = "",
  fullScreen = false,
  overlay = false,
}) {
  const spinnerClasses = `spinner spinner-${size} spinner-${color}`;

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          <div className={spinnerClasses}>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className={spinnerClasses}>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className={spinnerClasses}>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

// Simple spinning circle variant
export function SimpleSpinner({ size = 24, color = "var(--primary)" }) {
  return (
    <svg
      className="simple-spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.4 31.4"
      />
    </svg>
  );
}

// Dots loading variant
export function DotsLoader({ color = "var(--primary)" }) {
  return (
    <div className="dots-loader">
      <span style={{ backgroundColor: color }}></span>
      <span style={{ backgroundColor: color }}></span>
      <span style={{ backgroundColor: color }}></span>
    </div>
  );
}

export default LoadingSpinner;
