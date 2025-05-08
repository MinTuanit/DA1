const Room = require("../models/room");

const createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        return res.status(201).send(room);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate({
            path: "cinema_id",
            select: "name"
        });

        const formattedRooms = rooms.map(room => ({
            _id: room._id,
            name: room.name,
            seat_count: room.seat_count,
            cinema: {
                cinema_id: room.cinema_id?._id,
                name: room.cinema_id?.name
            }
        }));

        return res.status(200).json(formattedRooms);
    } catch (error) {
        console.error("Lỗi server:", error);
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
        return res.status(200).send(room);
    } catch (error) {
        console.error("Lỗi server:", error);
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
        return res.status(200).send(rooms);
    } catch (error) {
        console.error("Lỗi server:", error);
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
        return res.status(200).send("Xóa phòng chiếu thành công");
    } catch (error) {
        console.error("Lỗi server:", error);
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
        return res.status(200).send(room);
    } catch (error) {
        console.error("Lỗi server:", error);
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