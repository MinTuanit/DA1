const Room = require("../models/room");
const Seat = require("../models/seat");
const mongoose = require("mongoose");

const createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        return res.status(201).json(room);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const createRoomWithSeats = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { cinema_id, name, seats } = req.body;

        if (!cinema_id) {
            return res.status(400).json({ error: { message: "Thiếu trường cinema_id" } });
        }

        const room = new Room({
            name,
            seat_count: seats.length,
            cinema_id,
        });

        await room.save({ session });

        const seatDocs = seats.map(seat => ({
            seat_name: seat.seat_name,
            seat_column: seat.seat_column,
            room_id: room._id
        }));

        await Seat.insertMany(seatDocs, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Tạo phòng chiếu và ghế thành công",
            room_id: room._id,
            seats_created: seatDocs.length
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
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
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: { message: "Phòng chiếu không tồn tại" } });
        }
        return res.status(200).json(room);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getRoomByCinemaId = async (req, res) => {
    try {
        const rooms = await Room.find({ cinema_id: req.params.cinemaid });
        if (!rooms || rooms.length === 0) {
            return res.status(404).json({ error: { message: "Không có phòng trong rạp này" } });
        }
        return res.status(200).json(rooms);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteRoomById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const roomId = req.params.id;
        const room = await Room.findByIdAndDelete(roomId, { session });
        if (!room) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: { message: "Phòng chiếu không tồn tại" } });
        }

        await Seat.deleteMany({ room_id: roomId }, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Xóa phòng chiếu thành công" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const updateRoomWithSeatsById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const roomId = req.params.id;
        const { name, cinema_id, seats } = req.body;

        const room = await Room.findByIdAndUpdate(
            roomId,
            { name, cinema_id },
            { new: true, session }
        );
        if (!room) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: { message: "Phòng chiếu không tồn tại" } });
        }

        await Seat.deleteMany({ room_id: roomId }, { session });

        if (Array.isArray(seats) && seats.length > 0) {
            const seatDocs = seats.map(seat => ({
                seat_name: seat.seat_name,
                seat_column: seat.seat_column,
                room_id: roomId
            }));
            await Seat.insertMany(seatDocs, { session });
        }

        const seatCount = await Seat.countDocuments({ room_id: roomId }).session(session);
        room.seat_count = seatCount;
        await room.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(room);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

module.exports = {
    createRoom,
    updateRoomWithSeatsById,
    getAllRooms,
    deleteRoomById,
    getRoomById,
    getRoomByCinemaId,
    createRoomWithSeats
};