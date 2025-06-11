const router = require("express").Router();
const orderproductcontroller = require("../controllers/orderproductdetail")

router.get("/", orderproductcontroller.getAllOrderProducts);
router.get("/order/:orderid", orderproductcontroller.getOrderProductsByOrderId);
router.get("/:id", orderproductcontroller.getOrderProductById);
router.post("/", orderproductcontroller.createOrderProduct);
router.patch("/:id", orderproductcontroller.updateOrderProductById);
router.delete("/:id", orderproductcontroller.deleteOrderProductById);

module.exports = router;