import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap/dist/js/bootstrap.bundle.js";

import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Home from "./components/common/Home";
import Signin from "./components/auth/SignIn";
import Signup from "./components/auth/SignUp";
import UserProfile from "./components/common/UserProfile";
import CreateRide from "./components/rider/CreateRide";
import MyRides from "./components/rider/MyRides";
import RideList from "./components/user/RideList";
import Current from "./components/user/Current";
import UserContext from "./components/contexts/UserContext";
import Notifications from "./components/common/Notifications"
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";

const browserRouterObj = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "signin",
          element: <Signin />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
        {
          path: "noti",
          element: <Notifications />,
        },
        {
          path: "rider/:email",
          element: <UserProfile />,
          children: [
            {
              path: "my",
              element: <MyRides />,
            },
            {
              path: "ride",
              element: <CreateRide />,
            },
            {
              path: "",
              element: <Navigate to="my" />,
            },
          ],
        },
        {
          path: "user/:email",
          element: <UserProfile />,
          children: [
            {
              path: "rides",
              element: <RideList />,
            },
            {
              path: "current",
              element: <Current />,
            },
            {
              path: "",
              element: <Navigate to="rides" />,
            },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserContext>
      <RouterProvider
        router={browserRouterObj}
        future={{
          v7_startTransition: true,
        }}
      />
    </UserContext>
  </StrictMode>
);
