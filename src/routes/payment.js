const router = require("express").Router();
const paymentcontroller = require("../controllers/paymentcontroller")

router.get("/", paymentcontroller.getAllPayments);
router.get("/:id", paymentcontroller.getPaymentById);
router.post("/", paymentcontroller.createPayment);
router.patch("/:id", paymentcontroller.updatePaymentById);
router.delete("/:id", paymentcontroller.deletePaymentById);

module.exports = router;