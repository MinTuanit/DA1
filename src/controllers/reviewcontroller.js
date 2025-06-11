const Review = require("../models/review");
const Movie = require("../models/movie");

const createReview = async (req, res) => {
    try {
        const review = await Review.create(req.body);

        const movieId = review.movie_id;
        const reviews = await Review.find({ movie_id: movieId });

        const avgRating =
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / (reviews.length || 1);

        await Movie.findByIdAndUpdate(movieId, { rating: avgRating });
        return res.status(201).json(review);
    } catch (error) {
        console.error("Lỗi server! ", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate({ path: 'user_id', select: 'full_name email' })
            .populate({ path: 'movie_id', select: 'title' });

        if (!reviews || reviews.length === 0) {
            console.log("Không có bình luận nào!");
            return res.status(404).json({ error: { message: "Không có bình luận nào!" } });
        }

        const formattedReviews = reviews.map(review => ({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            user: review.user_id ? {
                user_id: review.user_id._id,
                full_name: review.user_id.full_name,
                email: review.user_id.email
            } : null,
            movie: review.movie_id ? {
                movie_id: review.movie_id._id,
                title: review.movie_id.title
            } : null
        }));

        return res.status(200).json(formattedReviews);
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            console.log("Bình luận không tồn tại!");
            return res.status(404).json({ error: { message: "Bình luận không tồn tại" } });
        }
        return res.status(200).json(review);
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getReviewByMovieId = async (req, res) => {
    try {
        const reviews = await Review.find({ movie_id: req.params.movieid })
            .populate({ path: 'user_id', select: 'full_name email' });

        if (!reviews || reviews.length === 0) {
            console.log("Không có bình luận của phim này!");
            return res.status(404).json({ error: { message: "Không có bình luận của phim này!" } });
        }

        const formattedReviews = reviews.map(review => ({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            user: review.user_id ? {
                user_id: review.user_id._id,
                full_name: review.user_id.full_name,
                email: review.user_id.email
            } : null
        }));

        return res.status(200).json(formattedReviews);
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getReviewWithUserInfo = async (req, res) => {
    try {
        const reviewId = req.params.reviewid;

        const review = await Review.findById(reviewId)
            .populate({ path: 'user_id', select: 'full_name email' });

        if (!review) {
            return res.status(404).json({ error: { message: "Không tìm thấy review" } });
        }

        const formattedReview = {
            _id: review._id,
            movie_id: review.movie_id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            user: review.user_id ? {
                user_id: review.user_id._id,
                full_name: review.user_id.full_name,
                email: review.user_id.email,
            } : null
        };

        return res.status(200).json(formattedReview);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const deleteReviewById = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            console.log("Bình luận không tồn tại!");
            return res.status(404).json({ error: { message: "Bình luận không tồn tại" } });
        }
        return res.status(200).json({ message: "Xóa bình luận thành công" });
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const deleteReviewByMovieId = async (req, res) => {
    try {
        const result = await Review.deleteMany({ movie_id: req.params.movieid });
        if (result.deletedCount === 0) {
            console.log("Không có bình luận nào được tìm thấy để xóa!");
            return res.status(404).json({ error: { message: "Không có bình luận nào được tìm thấy để xóa" } });
        }
        console.log(`${result.deletedCount} bình luận đã được xóa.`);
        return res.status(200).json({ message: `${result.deletedCount} bình luận đã được xóa.` });
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const updateReviewById = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!review) {
            console.log("Bình luận không tồn tại!");
            return res.status(404).json({ error: { message: "Bình luận không tồn tại" } });
        }
        return res.status(200).json(review);
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

module.exports = {
    createReview,
    updateReviewById,
    getAllReviews,
    deleteReviewById,
    getReviewById,
    getReviewByMovieId,
    deleteReviewByMovieId,
    getReviewWithUserInfo
};