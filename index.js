const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
var bodyParser = require("body-parser");
const app = express();
const routes = require("./src/routes")

dotenv.config();

// Connect Database
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connecting to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log("Server is runing in port " + process.env.PORT);
    })
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // exit program if dont conneted
  });

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("common")); // see the result in terminal
app.use("/v1", routes);