const ShowTime = require("../models/showtime");
const Movie = require("../models/movie");
const { Op } = require('sequelize');

const createShowTime = async (req, res) => {
    try {
        const { movie_id, showtime, price, room_id } = req.body;

        const movie = await Movie.findById(movie_id);
        if (!movie) {
            return res.status(404).send("Movie không tồn tại.");
        }

        const duration = movie.duration;
        const newStart = new Date(showtime);
        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + duration);

        const existingShowtimes = await ShowTime.find({
            room_id,
            showtime: { $lt: newEnd }
        }).populate('movie_id');

        // Lọc ra các lịch trùng bằng cách kiểm tra showtime + duration của từng lịch cũ
        const isOverlapping = existingShowtimes.some(existing => {
            const existingStart = new Date(existing.showtime);
            const existingDuration = existing.movie_id?.duration || 0;
            const existingEnd = new Date(existingStart);
            existingEnd.setMinutes(existingEnd.getMinutes() + existingDuration);

            return newStart < existingEnd && newEnd > existingStart;
        });

        if (isOverlapping) {
            return res.status(400).send("Lịch chiếu bị trùng với lịch chiếu khác trong phòng.");
        }

        const newShowtime = new ShowTime({
            showtime: newStart,
            price,
            movie_id,
            room_id
        });

        await newShowtime.save();
        return res.status(201).send(newShowtime);

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
                select: "title",
                strictPopulate: false
            })
            .populate({
                path: "room_id",
                select: "name",
                strictPopulate: false
            });
        const filteredShowtimes = showtimes.filter(s => s.movie_id && s.room_id);
        const formattedShowtimes = filteredShowtimes.map(showtime => ({
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


const getCurrentShowtime = async (req, res) => {
    try {
        const now = new Date();

        const movies = await Movie.aggregate([
            {
                $match: {
                    status: { $in: ['Now Playing', 'Coming Soon'] }
                }
            },
            {
                $lookup: {
                    from: 'showtimes',
                    localField: '_id',
                    foreignField: 'movie_id',
                    as: 'showtimes'
                }
            },
            {
                $addFields: {
                    showtimes: {
                        $filter: {
                            input: '$showtimes',
                            as: 'showtime',
                            cond: { $gt: ['$$showtime.showtime', now] }
                        }
                    }
                }
            }
        ]);
        return res.status(200).json({ data: movies });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server Error' });
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
    getShowTimeByMovieId,
    getCurrentShowtime
};