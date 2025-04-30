
# 🚗 RideShare MERN App

A full-stack carpooling application that allows users to post, find, and request rides. Built with the **MERN stack** (MongoDB, Express.js, React, Node.js), it supports real-time ride discovery, geo-based filtering, notifications, and user interaction.

---

## 🧩 Features

- **User System**: Register and manage users using email lookup.
- **Ride Creation**: Post rides with seats, timing, pickup/drop locations, and status flags.
- **Ride Discovery**: View all rides, filter by location, and see upcoming ones.
- **Ride Requests**: Request seats in posted rides and get notified upon approval/denial.
- **Geo Search**: Find rides near specific geographic coordinates.
- **Soft Delete**: Mark rides inactive without removing them from the database.
- **Notification System**: Users receive alerts when ride requests are made or updated.

---

## 📁 Project Structure

```
CAR_POOLING/
├── client/               # Frontend (Vite + React)
│   ├── src/              # React source files
│   ├── .env.local        # Vite environment vars
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/               # Backend (Express.js + MongoDB)
│   ├── APIs/             # API endpoint handlers
│   ├── models/           # Mongoose schemas
│   ├── .env              # Backend environment vars
│   ├── server.js         # Express app entry point
│   └── package.json
│
├── README.md
```

---

## 🖥️ Frontend

Built using **Vite** and **React**, the client app allows users to interact with the platform through a modern and responsive UI.

### Setup

```bash
cd client
npm install
npm run dev
```

- Environment variables go in `.env.local` (e.g., API base URL).
- Uses Axios or Fetch to communicate with the backend.

---

## ⚙️ Backend

Powered by **Node.js**, **Express**, and **MongoDB**, the backend handles all ride logic, user management, and notifications.

### Setup

```bash
cd server
npm install
npm start
```

- Environment variables go in `.env` (e.g., MongoDB URI, port).
- Uses Mongoose for MongoDB modeling.
- Implements geospatial queries with `$geoNear`.

---

## 🧪 Sample Environment Files

### `client/.env.local`

```
VITE_CLERK_PUBLISHABLE_KEY = your_key
```

### `server/.env`

```
DBURL = your_mongo_connection_string
PORT = 5000
```

---

## 🚀 Deployment

- [**nihesh-ride-share**](https://nihesh-ride-share.vercel.app)

---

## 📌 Notes

- MongoDB collections use geospatial indexing to allow geo-based ride filtering.
- Notifications are stored and fetched via API.
- Seat availability is automatically updated based on accepted requests.
- Each ride can be soft-deleted (marked inactive) instead of being removed.
- The frontend dynamically filters rides based on user location or time.

---

## 🙌 Contributing

Pull requests and feedback are welcome. Feel free to fork the repo, improve functionality, or polish UI/UX.

---

## 🧑‍💻 Author

Developed with ❤️ by ***Nihesh***.

---
