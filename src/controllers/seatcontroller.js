const Seat = require("../models/seat");
const Showtime = require("../models/showtime");
const Ticket = require("../models/ticket");
const Room = require("../models/room");

const createSeat = async (req, res) => {
    try {
        const seat = await Seat.create(req.body);
        return res.status(201).send(seat);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const createSeats = async (req, res) => {
    try {
        const seatsData = req.body;
        if (!Array.isArray(seatsData)) {
            return res.status(400).send("Dữ liệu gửi lên phải là mảng các ghế");
        }

        const seats = await Seat.insertMany(seatsData);
        return res.status(201).send(seats);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const resetSeats = async (req, res) => {
    try {
        const { room_id, seats } = req.body;
        if (!Array.isArray(seats) || !room_id) {
            return res.status(400).send("Thiếu dữ liệu room_id hoặc danh sách ghế");
        }
        // Xoá ghế cũ
        await Seat.deleteMany({ room_id });
        // Tạo lại ghế
        const newSeats = await Seat.insertMany(seats);
        return res.status(201).send(newSeats);
    } catch (error) {
        console.log("Lỗi reset ghế: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllSeats = async (req, res) => {
    try {
        const seats = await Seat.find();
        return res.status(201).send(seats);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getSeatById = async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) {
            console.log("Ghế không tồn tại!");
            return res.status(404).send("Ghế không tồn tại");
        }
        return res.status(201).send(seat);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getSeatByRoomId = async (req, res) => {
    try {
        const seats = await Seat.find({ room_id: req.params.roomid });
        if (!seats || seats.length === 0) {
            console.log("Không có ghế trong phòng này!");
            return res.status(404).send("Không có ghế trong phòng này");
        }
        return res.status(200).send(seats);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getSeatByShowtimeId = async (req, res) => {
    try {
      const { showtimeid } = req.params;
      const showtime = await Showtime.findById(showtimeid);
      console.log(showtimeid);
      if (!showtime) 
      return res.status(404).json({ message: "Không tìm thấy lịch chiếu phim tương ứng" });
      const roomId = showtime.room_id;
      const seats = await Seat.find({ room_id: roomId });
 
      const bookedTickets = await Ticket.find({ showtime_id: showtimeid }).select('seat_id');
  
      const bookedSeatIds = bookedTickets.map(ticket => ticket.seat_id.toString());

      const seatWithAvailability = seats.map(seat => ({
        ...seat.toObject(),
        available: !bookedSeatIds.includes(seat._id.toString())
      }));
  
      return res.status(200).json({ data: seatWithAvailability });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server' });
    }
};

const deleteSeatById = async (req, res) => {
    try {
        const seat = await Seat.findByIdAndDelete(req.params.id);
        if (!seat) {
            console.log("Ghế không tồn tại!");
            return res.status(404).send("Ghế không tồn tại");
        }
        else return res.status(204).send("Xóa ghế thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteSeatByRoomId = async (req, res) => {
    try {
        const result = await Seat.deleteMany({ room_id: req.params.roomid });
        if (result.deletedCount === 0) {
            console.log("Không có ghế nào được tìm thấy để xóa!");
            return res.status(404).send("Không có ghế nào được tìm thấy để xóa");
        }
        console.log(`${result.deletedCount} ghế đã được xóa.`);
        return res.status(200).send(`${result.deletedCount} ghế đã được xóa.`);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateSeatById = async (req, res) => {
    try {
        const seat = await Seat.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!seat) {
            console.log("Ghế không tồn tại!");
            return res.status(404).send("Ghế không tồn tại");
        }
        return res.status(200).send(seat);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createSeat,
    createSeats,
    updateSeatById,
    getAllSeats,
    deleteSeatById,
    getSeatById,
    getSeatByRoomId,
    deleteSeatByRoomId,
    resetSeats,
    getSeatByShowtimeId
};