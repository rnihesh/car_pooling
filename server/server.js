const exp = require("express");
const app = exp();
require("dotenv").config();
const mongoose = require("mongoose");

const userApp = require("./APIs/userApi");

const cors = require("cors");
app.use(cors());
app.set("trust proxy", true);

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Car Pooling API is running");
});
//db connect
mongoose
  .connect(process.env.DBURL)
  .then(() => {
    app.listen(port, "0.0.0.0", () =>
      console.log(`Server listening on port : ${port}`)
    );
    console.log("DB Connection Success");
  })
  .catch((err) => console.log("Error in DB Connection : ", err));

app.use(exp.json());

app.use("/user", userApp);
