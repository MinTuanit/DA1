const router = require("express").Router();
const revenuecontroller = require("../controllers/revenuecontroller");

router.get("/", revenuecontroller.getAll);
router.get("/date", revenuecontroller.getRevenueReport);

module.exports = router;