const router = require("express").Router();
const orderproductcontroller = require("../controllers/orderproductdetail")

router.get("/", orderproductcontroller.getAllOderproducts);
router.get("/order/:orderid", orderproductcontroller.getOrderproductByOrderId);
router.get("/:id", orderproductcontroller.getOrderproductById);
router.post("/", orderproductcontroller.createOderproduct);
router.patch("/:id", orderproductcontroller.updateOderproductById);
router.delete("/:id", orderproductcontroller.deleteOderproductById);

module.exports = router;