// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === "development";

// Get the base URL based on environment
export const getBaseUrl = () => {
  return isDevelopment
    ? "http://localhost:3000"
    : `${import.meta.env.VITE_RENDER_URL}`; // Backend URL on Render
};
