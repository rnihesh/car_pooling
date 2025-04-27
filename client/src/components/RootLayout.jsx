import React from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <div>
      <Header />
      <div style={{ minHeight: "90vh", height: "100%" }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default RootLayout;
