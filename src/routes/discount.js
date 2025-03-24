const router = require("express").Router();
const discountcontroller = require("../controllers/discountcontroller")

router.get("/", discountcontroller.getAllDiscounts);
router.get("/:id", discountcontroller.getDiscountById);
router.post("/", discountcontroller.createDiscount);
router.patch("/:id", discountcontroller.updateDiscountById);
router.delete("/:id", discountcontroller.deleteDiscountById);

module.exports = router;