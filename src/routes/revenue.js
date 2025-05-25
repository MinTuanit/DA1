const router = require("express").Router();
const revenuecontroller = require("../controllers/revenuecontroller");

router.get("/", revenuecontroller.getAll);
router.get("/all", revenuecontroller.getAllRevenueReport);
router.get("/date/product", revenuecontroller.getDailyProductSalesByProduct);
router.get("/date/movie", revenuecontroller.getDailyTicketRevenueByMovie);

module.exports = router;