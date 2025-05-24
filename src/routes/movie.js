const router = require("express").Router();
const moviecontroller = require("../controllers/moviecontroller");
const auth = require("../middlewares/auth");

router.get("/status", moviecontroller.getMovieByStatus);
router.get("/", moviecontroller.getAllMovies);
router.get("/:id", moviecontroller.getMovieById);
router.post("/", auth("manageMovie"), moviecontroller.createMovie);
router.patch("/:id", auth("manageMovie"), moviecontroller.updateMovieById);
router.delete("/:id", auth("manageMovie"), moviecontroller.deleteMovieById);

module.exports = router;