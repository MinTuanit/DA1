const router = require("express").Router();
const ordercontroller = require("../controllers/ordercontroller")

router.get("/", ordercontroller.getAllOrders);
router.get("/userinfo/:orderid", ordercontroller.getOrderWithUserInfo);
router.get("/user/:userid", ordercontroller.getOrderByUserId);
router.get("/:id", ordercontroller.getOrderById);
router.post("/", ordercontroller.createOrder);
router.patch("/:id", ordercontroller.updateOrderById);
router.delete("/user/:userid", ordercontroller.deleteOrderByUserId);
router.delete("/:id", ordercontroller.deleteOrderById);

module.exports = router;