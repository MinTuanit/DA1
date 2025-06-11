const Seat = require("../models/seat");
const Showtime = require("../models/showtime");
const Ticket = require("../models/ticket");

const createSeat = async (req, res) => {
    try {
        const seat = await Seat.create(req.body);
        return res.status(201).json(seat);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const createSeats = async (req, res) => {
    try {
        const seatsData = req.body;
        if (!Array.isArray(seatsData)) {
            return res.status(400).json({ error: { message: "Dữ liệu gửi lên phải là mảng các ghế" } });
        }

        const seats = await Seat.insertMany(seatsData);
        return res.status(201).json(seats);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const resetSeats = async (req, res) => {
    try {
        const { room_id, seats } = req.body;
        if (!room_id || !Array.isArray(seats)) {
            return res.status(400).json({ error: { message: "Thiếu dữ liệu room_id hoặc danh sách ghế" } });
        }

        await Seat.deleteMany({ room_id });
        const newSeats = await Seat.insertMany(seats);

        return res.status(201).json(newSeats);
    } catch (error) {
        console.error("Lỗi reset ghế:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getAllSeats = async (req, res) => {
    try {
        const seats = await Seat.find();
        return res.status(200).json(seats);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getSeatById = async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) {
            return res.status(404).json({ error: { message: "Ghế không tồn tại" } });
        }
        return res.status(200).json(seat);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getSeatByRoomId = async (req, res) => {
    try {
        const seats = await Seat.find({ room_id: req.params.roomid });
        if (!seats.length) {
            return res.status(404).json({ error: { message: "Không có ghế trong phòng này" } });
        }
        return res.status(200).json(seats);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getSeatByShowtimeId = async (req, res) => {
    try {
        const { showtimeid } = req.params;
        const showtime = await Showtime.findById(showtimeid);
        if (!showtime) {
            return res.status(404).json({ error: { message: "Không tìm thấy lịch chiếu phim tương ứng" } });
        }

        const seats = await Seat.find({ room_id: showtime.room_id });
        const bookedTickets = await Ticket.find({ showtime_id: showtimeid }).select("seat_id");
        const bookedSeatIds = bookedTickets.map(ticket => ticket.seat_id.toString());

        const seatWithAvailability = seats.map(seat => ({
            ...seat.toObject(),
            available: !bookedSeatIds.includes(seat._id.toString())
        }));

        return res.status(200).json({ data: seatWithAvailability });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteSeatById = async (req, res) => {
    try {
        const seat = await Seat.findByIdAndDelete(req.params.id);
        if (!seat) {
            return res.status(404).json({ error: { message: "Ghế không tồn tại" } });
        }
        return res.status(200).json({ message: "Xóa ghế thành công" });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteSeatByRoomId = async (req, res) => {
    try {
        const result = await Seat.deleteMany({ room_id: req.params.roomid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: { message: "Không có ghế nào được tìm thấy để xóa" } });
        }
        return res.status(200).json({ message: `${result.deletedCount} ghế đã được xóa.` });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const updateSeatById = async (req, res) => {
    try {
        const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!seat) {
            return res.status(404).json({ error: { message: "Ghế không tồn tại" } });
        }
        return res.status(200).json(seat);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

module.exports = {
    createSeat,
    createSeats,
    resetSeats,
    getAllSeats,
    getSeatById,
    getSeatByRoomId,
    getSeatByShowtimeId,
    updateSeatById,
    deleteSeatById,
    deleteSeatByRoomId
};