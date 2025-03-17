const express = require("express");
const productRoute = require("./product");
const userRoute = require("./user");
const authRoute = require("./auth");

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
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
