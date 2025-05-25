const router = require("express").Router();
const revenuecontroller = require("../controllers/revenuecontroller");

router.get("/", revenuecontroller.getAll);
router.post("/all", revenuecontroller.getAllRevenueReport);
router.post("/date/product", revenuecontroller.getDailyProductSalesByProduct);
router.post("/date/movie", revenuecontroller.getDailyTicketRevenueByMovie);

module.exports = router;