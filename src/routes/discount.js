const router = require("express").Router();
const discountcontroller = require("../controllers/discountcontroller");
const auth = require("../middlewares/auth");

router.get("/", auth("getDiscount"), discountcontroller.getAllDiscounts);
router.get("/code/:code", auth("getDiscount"), discountcontroller.getDiscountByCode);
router.get("/:id", auth("getDiscount"), discountcontroller.getDiscountById);
router.post("/", auth("manageDiscount"), discountcontroller.createDiscount);
router.patch("/:id", auth("manageDiscount"), discountcontroller.updateDiscountById);
router.delete("/:id", auth("manageDiscount"), discountcontroller.deleteDiscountById);

module.exports = router;