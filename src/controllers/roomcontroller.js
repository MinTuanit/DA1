const Room = require("../models/room");

const createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        res.status(201).send(room);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(201).send(rooms);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            console.log("Phòng chiếu không tồn tại!");
            return res.status(404).send("Phòng chiếu không tồn tại");
        }
        res.status(201).send(room);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getRoomByCinemaId = async (req, res) => {
    try {
        const rooms = await Room.find({ cinema_id: req.params.cinemaid });
        if (!rooms || rooms.length === 0) {
            console.log("Không có phòng trong rạp này!");
            return res.status(404).send("Không có phòng trong rạp này");
        }
        res.status(200).send(rooms);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteRoomById = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            console.log("Phòng chiếu không tồn tại!");
            return res.status(404).send("Phòng chiếu không tồn tại");
        }
        else return res.status(204).send("Xóa phòng chiếu thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateRoomById = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!room) {
            console.log("Phòng chiếu không tồn tại!");
            return res.status(404).send("Phòng chiếu không tồn tại");
        }
        res.status(200).send(room);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createRoom,
    updateRoomById,
    getAllRooms,
    deleteRoomById,
    getRoomById,
    getRoomByCinemaId
};