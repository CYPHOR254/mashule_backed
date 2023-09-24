const express = require("express");
const cors = require("cors");
const connection = require("./database");
const UserRoutes = require("./routes/user");
const SchoolRoutes = require("./routes/school");
const imageRoutes = require("./routes/image.js");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const db = require("./database.js");
const Event = require ("./routes/events")
const Logo = require ("./routes/logo")
const app = express();
const port = 8080;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/user", UserRoutes);
app.use(SchoolRoutes);
app.use("/event" , Event);
app.use(Logo)
app.use("/image", imageRoutes);
app.use(express.static("public"));
app.use("/images", express.static("images"));

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

module.exports = app;
