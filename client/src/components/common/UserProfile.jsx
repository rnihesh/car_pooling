import React from "react";
import { Outlet } from "react-router-dom";

function UserProfile() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default UserProfile;
