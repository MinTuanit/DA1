const Seat = require("../models/seat");

const createSeat = async (req, res) => {
    try {
        const seat = await Seat.create(req.body);
        res.status(201).send(seat);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllSeats = async (req, res) => {
    try {
        const seats = await Seat.find();
        res.status(201).send(seats);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getSeatById = async (req, res) => {
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) {
            console.log("Sản phẩm không tồn tại!");
            return res.status(404).send("Sản phẩm không tồn tại");
        }
        res.status(201).send(seat);
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
        res.status(200).send(seats);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteSeatById = async (req, res) => {
    try {
        const seat = await Seat.findByIdAndDelete(req.params.id);
        if (!seat) {
            console.log("Sản phẩm không tồn tại!");
            return res.status(404).send("Sản phẩm không tồn tại");
        }
        else return res.status(204).send("Xóa sản phẩm thành công");
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
        res.status(200).send(`${result.deletedCount} ghế đã được xóa.`);
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
            console.log("Sản phẩm không tồn tại!");
            return res.status(404).send("Sản phẩm không tồn tại");
        }
        res.status(200).send(seat);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createSeat,
    updateSeatById,
    getAllSeats,
    deleteSeatById,
    getSeatById,
    getSeatByRoomId,
    deleteSeatByRoomId
};