const ShowTime = require("../models/showtime");

const createShowTime = async (req, res) => {
    try {
        const showtime = await ShowTime.create(req.body);
        return res.status(201).send(showtime);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllShowTimes = async (req, res) => {
    try {
        const showtimes = await ShowTime.find()
            .populate({
                path: "movie_id",
                select: "title"
            })
            .populate({
                path: "room_id",
                select: "name"
            });

        const formattedShowtimes = showtimes.map(showtime => ({
            _id: showtime._id,
            showtime: showtime.showtime,
            price: showtime.price,
            movie: {
                movie_id: showtime.movie_id._id,
                title: showtime.movie_id.title
            },
            room: {
                room_id: showtime.room_id._id,
                name: showtime.room_id.name
            }
        }));

        return res.status(200).json(formattedShowtimes);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};


const getShowTimeById = async (req, res) => {
    try {
        const showtime = await ShowTime.findById(req.params.id)
            .populate({
                path: "movie_id",
                select: "title"
            })
            .populate({
                path: "room_id",
                select: "name"
            });

        if (!showtime) {
            return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
        }

        const formattedShowtimes = {
            _id: showtime._id,
            showtime: showtime.showtime,
            price: showtime.price,
            movie: {
                movie_id: showtime.movie_id._id,
                title: showtime.movie_id.title
            },
            room: {
                room_id: showtime.room_id._id,
                name: showtime.room_id.name
            }
        };

        return res.status(200).json(formattedShowtimes);
    } catch (error) {
        console.error("Lỗi khi lấy showtime:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

const getShowTimeByMovieId = async (req, res) => {
    try {
        const showtimes = await ShowTime.find({ movie_id: req.params.movieid });
        if (!showtimes || showtimes.length === 0) {
            console.log("Không có lịch chiếu của phim này!");
            return res.status(404).send("Không có lịch chiếu của phim này!");
        }
        return res.status(200).send(showtimes);
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
        return res.status(200).send(showtime);
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