const router = require("express").Router();
const cinemacontroller = require("../controllers/cinemacontroller")

router.get("/", cinemacontroller.getAllCinemas);
router.get("/:id", cinemacontroller.getACinema);
router.post("/", cinemacontroller.createCinema);
router.patch("/:id", cinemacontroller.updateCinemaById);
router.delete("/:id", cinemacontroller.deleteCinemaById);

module.exports = router;