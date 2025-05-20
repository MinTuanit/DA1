const router = require("express").Router();
const showtimecontroller = require("../controllers/showtimecontroller");
const auth = require("../middlewares/auth");

router.get("/", auth("getShowTime"), showtimecontroller.getAllShowTimes);
router.get("/current", showtimecontroller.getCurrentShowtime);
router.get("/movie/:movieid", auth("getShowTime"), showtimecontroller.getShowTimeByMovieId);
router.get("/:id", auth("getShowTime"), showtimecontroller.getShowTimeById);
router.post("/", auth("manageShowTime"), showtimecontroller.createShowTime);
router.patch("/:id", auth("manageShowTime"), showtimecontroller.updateShowTimeById);
router.delete("/:id", auth("manageShowTime"), showtimecontroller.deleteShowTimeById);

module.exports = router;