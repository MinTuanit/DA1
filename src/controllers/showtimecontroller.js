const ShowTime = require("../models/showtime");

const createShowTime = async (req, res) => {
    try {
        const showtime = await ShowTime.create(req.body);
        res.status(201).send(showtime);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllShowTimes = async (req, res) => {
    try {
        const showtimes = await ShowTime.find();
        res.status(201).send(showtimes);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getShowTimeById = async (req, res) => {
    try {
        const showtime = await ShowTime.findById(req.params.id);
        if (!showtime) {
            console.log("Lịch chiếu phim không tồn tại!");
            return res.status(404).send("Lịch chiếu phim không tồn tại");
        }
        res.status(201).send(showtime);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getShowTimeByMovieId = async (req, res) => {
    try {
        const showtimes = await ShowTime.find({ movie_id: req.params.movieid });
        if (!showtimes || showtimes.length === 0) {
            console.log("Không có lịch chiếu của phim này!");
            return res.status(404).send("Không có lịch chiếu của phim này!");
        }
        res.status(200).send(showtimes);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteShowTimeById = async (req, res) => {
    try {
        const showtime = await ShowTime.findByIdAndDelete(req.params.id);
        if (!showtime) {
            console.log("Lịch chiếu phim không tồn tại!");
            return res.status(404).send("Lịch chiếu phim không tồn tại");
        }
        else return res.status(204).send("Xóa lịch chiếu phim thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateShowTimeById = async (req, res) => {
    try {
        const showtime = await ShowTime.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!showtime) {
            console.log("Lịch chiếu phim không tồn tại!");
            return res.status(404).send("Lịch chiếu phim không tồn tại");
        }
        res.status(200).send(showtime);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createShowTime,
    updateShowTimeById,
    getAllShowTimes,
    deleteShowTimeById,
    getShowTimeById,
    getShowTimeByMovieId
};