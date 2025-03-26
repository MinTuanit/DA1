const router = require("express").Router();
const showtimecontroller = require("../controllers/showtimecontroller")

router.get("/", showtimecontroller.getAllShowTimes);
router.get("/movie/:movieid", showtimecontroller.getShowTimeByMovieId);
router.get("/:id", showtimecontroller.getShowTimeById);
router.post("/", showtimecontroller.createShowTime);
router.patch("/:id", showtimecontroller.updateShowTimeById);
router.delete("/:id", showtimecontroller.deleteShowTimeById);

module.exports = router;