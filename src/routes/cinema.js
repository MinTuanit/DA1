const router = require("express").Router();
const cinemacontroller = require("../controllers/cinemacontroller");
const auth = require("../middlewares/auth");

router.get("/employeeandroom/:cinemaid", auth("getCinema"), cinemacontroller.getEmployeeAndRoomById);
router.get("/", auth("getCinema"), cinemacontroller.getAllCinemas);
router.get("/:id", auth("getCinema"), cinemacontroller.getCinemaById);
router.post("/", auth("manageCinema"), cinemacontroller.createCinema);
router.patch("/:id", auth("manageCinema"), cinemacontroller.updateCinemaById);
router.delete("/:id", auth("manageCinema"), cinemacontroller.deleteCinemaById);

module.exports = router;