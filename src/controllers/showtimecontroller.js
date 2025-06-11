const ShowTime = require("../models/showtime");
const Movie = require("../models/movie");
const Setting = require("../models/constraint");
const { parseTimeToDate } = require('../utils/parseTimeToDate');

const createShowTime = async (req, res) => {
    try {
        const { movie_id, showtime, price, room_id } = req.body;

        const setting = await Setting.findOne();
        if (!setting) {
            return res.status(500).send("Không tìm thấy cài đặt hệ thống.");
        }

        // ràng buộc giá vé
        const { min_ticket_price, max_ticket_price, time_gap, open_time, close_time } = setting;
        if (price < min_ticket_price || price > max_ticket_price) {
            return res.status(400).send(`Giá vé phải nằm trong khoảng từ ${min_ticket_price} đến ${max_ticket_price}.`);
        }

        const movie = await Movie.findById(movie_id);
        if (!movie) {
            return res.status(404).send("Movie không tồn tại.");
        }

        // ràng buộc thời gian giữa các bộ phim
        const duration = movie.duration;
        const newStart = new Date(showtime);
        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + duration);

        const openTime = parseTimeToDate(newStart, open_time);
        const closeTime = parseTimeToDate(newStart, close_time);

        // Nếu close_time nhỏ hơn open_time, nghĩa là đóng cửa vào hôm sau
        if (closeTime <= openTime) {
            closeTime.setDate(closeTime.getDate() + 1);
        }

        if (newStart < openTime) {
            return res.status(400).send(`Lịch chiếu phải nằm trong khoảng từ ${open_time} đến ${close_time}`);
        }

        if (newEnd > closeTime) {
            return res.status(400).send(`Lịch chiếu phim không vượt quá thời gian đóng cửa`);
        }

        const existingShowtimes = await ShowTime.find({
            room_id,
            showtime: { $lt: newEnd }
        }).populate('movie_id');

        const isOverlapping = existingShowtimes.some(existing => {
            const existingStart = new Date(existing.showtime);
            const existingDuration = existing.movie_id?.duration || 0;
            const existingEnd = new Date(existingStart);
            existingEnd.setMinutes(existingEnd.getMinutes() + existingDuration + time_gap);

            return newStart < existingEnd && newEnd > existingStart;
        });

        if (isOverlapping) {
            return res.status(400).send("Lịch chiếu bị trùng với lịch chiếu khác trong phòng hoặc không đủ thời gian dọn dẹp.");
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
        const showtimes = await ShowTime.find({ movie_id: req.params.movieid })
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

        if (filteredShowtimes.length === 0) {
            console.log("Không có lịch chiếu của phim này!");
            return res.status(404).send("Không có lịch chiếu của phim này!");
        }

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
        const { showtime, price, room_id } = req.body;
        const movie_id = req.body.movie.movie_id;
        console.log(req.body);
        const setting = await Setting.findOne();
        if (!setting) {
            return res.status(500).send("Không tìm thấy cài đặt hệ thống.");
        }

        const { min_ticket_price, max_ticket_price, time_gap, open_time, close_time } = setting;

        if (price < min_ticket_price || price > max_ticket_price) {
            return res.status(400).send(`Giá vé phải nằm trong khoảng từ ${min_ticket_price} đến ${max_ticket_price}.`);
        }

        const movie = await Movie.findById(movie_id);
        if (!movie) {
            return res.status(404).send("Movie không tồn tại.");
        }

        const duration = movie.duration;
        const newStart = new Date(showtime);
        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + duration);

        const openTime = parseTimeToDate(newStart, open_time);
        let closeTime = parseTimeToDate(newStart, close_time);

        if (closeTime <= openTime) {
            closeTime.setDate(closeTime.getDate() + 1);
        }

        if (newStart < openTime || newEnd > closeTime) {
            return res.status(400).send(`Lịch chiếu phải nằm trong khoảng từ ${open_time} đến ${close_time}`);
        }

        // Loại trừ chính lịch chiếu đang cập nhật
        const existingShowtimes = await ShowTime.find({
            _id: { $ne: req.params.id },
            room_id,
            showtime: { $lt: newEnd }
        }).populate('movie_id');

        const isOverlapping = existingShowtimes.some(existing => {
            const existingStart = new Date(existing.showtime);
            const existingDuration = existing.movie_id?.duration || 0;
            const existingEnd = new Date(existingStart);
            existingEnd.setMinutes(existingEnd.getMinutes() + existingDuration + time_gap);

            return newStart < existingEnd && newEnd > existingStart;
        });

        if (isOverlapping) {
            return res.status(400).send("Lịch chiếu bị trùng với lịch khác hoặc không đủ thời gian dọn dẹp.");
        }

        const updatedShowtime = await ShowTime.findByIdAndUpdate(
            req.params.id,
            {
                showtime: newStart,
                price,
                movie_id,
                room_id
            },
            { new: true }
        );

        if (!updatedShowtime) {
            return res.status(404).send("Lịch chiếu phim không tồn tại");
        }

        return res.status(200).send(updatedShowtime);

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