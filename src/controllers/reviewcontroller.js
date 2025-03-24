const Review = require("../models/review");

const createReview = async (req, res) => {
    try {
        const review = await Review.create(req.body);
        res.status(201).send(review);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find();
        res.status(201).send(reviews);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            console.log("Bình luận không tồn tại!");
            return res.status(404).send("Bình luận không tồn tại");
        }
        res.status(201).send(review);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};


const getReviewByMovieId = async (req, res) => {
    try {
        const reviews = await Review.find({ movies_id: req.params.movieid });
        if (!reviews || reviews.length === 0) {
            console.log("Không có bình luận của phim này!");
            return res.status(404).send("Không có bình luận của phim này!");
        }
        res.status(200).send(reviews);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteReviewById = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            console.log("Bình luận không tồn tại!");
            return res.status(404).send("Bình luận không tồn tại");
        }
        else return res.status(204).send("Xóa bình luận thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteReviewByMovieId = async (req, res) => {
    try {
        const result = await Review.deleteMany({ movies_id: req.params.movieid });
        if (result.deletedCount === 0) {
            console.log("Không có bình luận nào được tìm thấy để xóa!");
            return res.status(404).send("Không có bình luận nào được tìm thấy để xóa");
        }
        console.log(`${result.deletedCount} bình luận đã được xóa.`);
        res.status(200).send(`${result.deletedCount} bình luận đã được xóa.`);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
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
            return res.status(404).send("Bình luận không tồn tại");
        }
        res.status(200).send(review);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createReview,
    updateReviewById,
    getAllReviews,
    deleteReviewById,
    getReviewById,
    getReviewByMovieId,
    deleteReviewByMovieId
};