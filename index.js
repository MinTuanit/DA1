const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
var bodyParser = require("body-parser");
const passport = require("./src/config/passport");
const app = express();
const routes = require("./src/routes");
const errorHandler = require("./src/middlewares/errorHandler");

dotenv.config();

// Connect Database
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connecting to MongoDB");
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1); // exit program if not connected
  });

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use(morgan("common")); // Log HTTP requests

// Initialize Passport middleware
app.use(passport.initialize());


// Define routes
app.use("/v1", routes);
app.use(errorHandler);
// Protected route
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('You have accessed a protected route!');
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
