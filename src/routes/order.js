const router = require("express").Router();
const ordercontroller = require("../controllers/ordercontroller");
const auth = require("../middlewares/auth");

router.get("/ticketandproduct/:orderid", ordercontroller.getTicketAndProductByOrderId);
router.get("/", ordercontroller.getAllOrders);
router.get("/userinfo/:orderid", ordercontroller.getOrderWithUserInfo);
router.get("/user/:userid", ordercontroller.getOrderByUserId);
router.get("/code/:ordercode", auth("getOrderBycode"), ordercontroller.getOrderByCode);
router.get("/:id", ordercontroller.getOrderById);
router.get("/details/:id", ordercontroller.getOrderWithInfoById);
router.post("/", ordercontroller.createOrder);
router.post("/orders", ordercontroller.createOrders);
router.patch("/:id", ordercontroller.updateOrderById);
router.delete("/user/:userid", ordercontroller.deleteOrderByUserId);
router.delete("/:id", ordercontroller.deleteOrderById);

module.exports = router;