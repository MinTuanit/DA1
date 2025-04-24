const router = require("express").Router();
const reviewcontroller = require("../controllers/reviewcontroller")

router.get("/userinfo/:reviewid", reviewcontroller.getReviewWithUserInfo);
router.get("/", reviewcontroller.getAllReviews);
router.get("/movie/:movieid", reviewcontroller.getReviewByMovieId);
router.get("/:id", reviewcontroller.getReviewById);
router.post("/", reviewcontroller.createReview);
router.patch("/:id", reviewcontroller.updateReviewById);
router.delete("/movie/:movieid", reviewcontroller.deleteReviewByMovieId);
router.delete("/:id", reviewcontroller.deleteReviewById);

module.exports = router;