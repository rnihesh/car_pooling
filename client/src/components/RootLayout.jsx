import React, { useEffect } from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
import { Outlet } from "react-router-dom";

import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function RootLayout({ pageProps }) {
  useEffect(() => {
    (async () => {
      const conn = navigator.connection || {};
      const hasBatteryAPI = "getBattery" in navigator;
      let bat = { level: null, charging: null };

      if (hasBatteryAPI) {
        try {
          const battery = await navigator.getBattery();
          bat.level = battery.level;
          bat.charging = battery.charging;
        } catch (e) {
          // console.warn("Battery API error:", e);
        }
      }
      const payload = {
        url: location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        touchSupport: "ontouchstart" in window,
        orientation: screen.orientation.type,
        batteryLevel: bat.level,
        charging: bat.charging,
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
      };

      if (import.meta.env.MODE === "production") {
        fetch("https://traana.vercel.app/tra", {
          // fetch("http://localhost:3000/tra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    })();
  }, []);
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <PrimeReactProvider>
        <div>
          <Header {...pageProps} />
          <div
            style={{ minHeight: "90vh", height: "100%", marginTop: "100px" }}
          >
            <Outlet {...pageProps} />
          </div>
          <Footer {...pageProps} />
        </div>
      </PrimeReactProvider>
    </ClerkProvider>
  );
}

export default RootLayout;
