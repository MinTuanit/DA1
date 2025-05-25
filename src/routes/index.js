const express = require("express");
const productRoute = require("./product");
const userRoute = require("./user");
const authRoute = require("./auth");
const employeeRoute = require("./employee");
const cinemaRoute = require("./cinema");
const movieRoute = require("./movie");
const discountRoute = require("./discount");
const roomRoute = require("./room");
const seatRoute = require("./seat");
const reviewRoute = require("./review");
const showtimeRoute = require("./showtime");
const ticketRoute = require("./ticket");
const orderRoute = require("./order");
const orderproductRoute = require("./orderproductdetail");
const paymentRoute = require("./payment");
const settingRoute = require("./setting");
const revenueRoute = require("./revenue");
const chatbotRoute = require("./chatbot");


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
  {
    path: "/seat",
    route: seatRoute,
  },
  {
    path: "/review",
    route: reviewRoute,
  },
  {
    path: "/showtime",
    route: showtimeRoute,
  },
  {
    path: "/ticket",
    route: ticketRoute,
  },
  {
    path: "/order",
    route: orderRoute,
  },
  {
    path: "/orderproduct",
    route: orderproductRoute,
  },
  {
    path: "/payment",
    route: paymentRoute,
  },
  {
    path: "/setting",
    route: settingRoute,
  },
  {
    path: "/revenue",
    route: revenueRoute
  },
  {
    path: "/chatbot",
    route: chatbotRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
