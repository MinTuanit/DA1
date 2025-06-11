const ShowTime = require("../models/showtime");
const Movie = require("../models/movie");
const Setting = require("../models/constraint");
const { parseTimeToDate } = require('../utils/parseTimeToDate');

const createShowTime = async (req, res) => {
    try {
        const { movie_id, showtime, price, room_id } = req.body;

        const setting = await Setting.findOne();
        if (!setting) {
            return res.status(500).json({ error: { message: "Không tìm thấy cài đặt hệ thống." } });
        }

        const { min_ticket_price, max_ticket_price, time_gap, open_time, close_time } = setting;
        if (price < min_ticket_price || price > max_ticket_price) {
            return res.status(400).json({ error: { message: `Giá vé phải nằm trong khoảng từ ${min_ticket_price} đến ${max_ticket_price}.` } });
        }

        const movie = await Movie.findById(movie_id);
        if (!movie) {
            return res.status(404).json({ error: { message: "Movie không tồn tại." } });
        }

        const duration = movie.duration;
        const newStart = new Date(showtime);
        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + duration);

        const openTimeDate = parseTimeToDate(newStart, open_time);
        const closeTimeDate = parseTimeToDate(newStart, close_time);
        if (closeTimeDate <= openTimeDate) {
            closeTimeDate.setDate(closeTimeDate.getDate() + 1);
        }

        if (newStart < openTimeDate || newEnd > closeTimeDate) {
            return res.status(400).json({ error: { message: `Lịch chiếu phải nằm trong khoảng từ ${open_time} đến ${close_time}` } });
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
            return res.status(400).json({ error: { message: "Lịch chiếu bị trùng với lịch chiếu khác trong phòng hoặc không đủ thời gian dọn dẹp." } });
        }

        const newShowtime = new ShowTime({
            showtime: newStart,
            price,
            movie_id,
            room_id
        });

        await newShowtime.save();
        return res.status(201).json(newShowtime);

    } catch (error) {
        console.error("Lỗi server! ", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getAllShowTimes = async (req, res) => {
    try {
        const showtimes = await ShowTime.find()
            .populate({ path: "movie_id", select: "title", strictPopulate: false })
            .populate({ path: "room_id", select: "name", strictPopulate: false });

        const filteredShowtimes = showtimes.filter(s => s.movie_id && s.room_id);
        const formatted = filteredShowtimes.map(s => ({
            _id: s._id,
            showtime: s.showtime,
            price: s.price,
            movie: { movie_id: s.movie_id._id, title: s.movie_id.title },
            room: { room_id: s.room_id._id, name: s.room_id.name }
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getShowTimeById = async (req, res) => {
    try {
        const s = await ShowTime.findById(req.params.id)
            .populate({ path: "movie_id", select: "title" })
            .populate({ path: "room_id", select: "name" });

        if (!s) {
            return res.status(404).json({ error: { message: "Không tìm thấy suất chiếu" } });
        }

        const formatted = {
            _id: s._id,
            showtime: s.showtime,
            price: s.price,
            movie: { movie_id: s.movie_id._id, title: s.movie_id.title },
            room: { room_id: s.room_id._id, name: s.room_id.name }
        };

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Lỗi khi lấy showtime:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getShowTimeByMovieId = async (req, res) => {
    try {
        const showtimes = await ShowTime.find({ movie_id: req.params.movieid })
            .populate({ path: "movie_id", select: "title", strictPopulate: false })
            .populate({ path: "room_id", select: "name", strictPopulate: false });

        const filtered = showtimes.filter(s => s.movie_id && s.room_id);

        if (filtered.length === 0) {
            return res.status(404).json({ error: { message: "Không có lịch chiếu của phim này!" } });
        }

        const formatted = filtered.map(s => ({
            _id: s._id,
            showtime: s.showtime,
            price: s.price,
            movie: { movie_id: s.movie_id._id, title: s.movie_id.title },
            room: { room_id: s.room_id._id, name: s.room_id.name }
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getCurrentShowtime = async (req, res) => {
    try {
        const now = new Date();

        const movies = await Movie.aggregate([
            { $match: { status: { $in: ['Now Playing', 'Coming Soon'] } } },
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
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteShowTimeById = async (req, res) => {
    try {
        const showtime = await ShowTime.findByIdAndDelete(req.params.id);
        if (!showtime) {
            return res.status(404).json({ error: { message: "Lịch chiếu phim không tồn tại" } });
        }
        return res.status(204).send();
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const updateShowTimeById = async (req, res) => {
    try {
        const { showtime, price, room_id } = req.body;
        const movie_id = req.body.movie.movie_id;

        const setting = await Setting.findOne();
        if (!setting) {
            return res.status(500).json({ error: { message: "Không tìm thấy cài đặt hệ thống." } });
        }

        const { min_ticket_price, max_ticket_price, time_gap, open_time, close_time } = setting;
        if (price < min_ticket_price || price > max_ticket_price) {
            return res.status(400).json({ error: { message: `Giá vé phải nằm trong khoảng từ ${min_ticket_price} đến ${max_ticket_price}.` } });
        }

        const movie = await Movie.findById(movie_id);
        if (!movie) {
            return res.status(404).json({ error: { message: "Movie không tồn tại." } });
        }

        const duration = movie.duration;
        const newStart = new Date(showtime);
        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + duration);

        const openTimeDate = parseTimeToDate(newStart, open_time);
        let closeTimeDate = parseTimeToDate(newStart, close_time);
        if (closeTimeDate <= openTimeDate) {
            closeTimeDate.setDate(closeTimeDate.getDate() + 1);
        }

        if (newStart < openTimeDate || newEnd > closeTimeDate) {
            return res.status(400).json({ error: { message: `Lịch chiếu phải nằm trong khoảng từ ${open_time} đến ${close_time}` } });
        }

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
            return res.status(400).json({ error: { message: "Lịch chiếu bị trùng với lịch khác hoặc không đủ thời gian dọn dẹp." } });
        }

        const updated = await ShowTime.findByIdAndUpdate(
            req.params.id,
            { showtime: newStart, price, movie_id, room_id },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: { message: "Lịch chiếu phim không tồn tại" } });
        }

        return res.status(200).json(updated);
    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
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