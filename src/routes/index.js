const express = require("express");
const productRoute = require("./product");
const userRoute = require("./user");
const authRoute = require("./auth");
const employeeRoute = require("./employee");
const cinemaRoute = require("./cinema");
const movieRoute = require("./movie");
const discountRoute = require("./discount");
const roomRoute = require("./room");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/employee",
    route: employeeRoute,
  },
  {
    path: "/cinema",
    route: cinemaRoute,
  },
  {
    path: "/movie",
    route: movieRoute,
  },
  {
    path: "/discount",
    route: discountRoute,
  },
  {
    path: "/room",
    route: roomRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
