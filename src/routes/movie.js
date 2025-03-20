const router = require("express").Router();
const moviecontroller = require("../controllers/moviecontroller")

router.get("/", moviecontroller.getAllMovies);
router.get("/:id", moviecontroller.getAMovies);
router.post("/", moviecontroller.createMovie);
router.patch("/:id", moviecontroller.updateMovieById);
router.delete("/:id", moviecontroller.deleteMovieById);

module.exports = router;