const Ticket = require("../models/ticket");

const createTicket = async (req, res) => {
    try {
        const ticket = await Ticket.create(req.body);
        return res.status(201).json(ticket);
    } catch (error) {
        console.error("Lỗi server!", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find();
        return res.status(200).json(tickets);
    } catch (error) {
        console.error("Lỗi server!", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate({
                path: "showtime_id",
                populate: [
                    { path: "movie_id", select: "title" },
                    { path: "room_id", select: "name" }
                ]
            })
            .populate({ path: "seat_id", select: "name" });

        if (!ticket) {
            return res.status(404).json({ error: { message: "Không tìm thấy vé" } });
        }

        const movie = ticket.showtime_id?.movie_id;
        const room = ticket.showtime_id?.room_id;
        const seat = ticket.seat_id;

        const formatted = {
            _id: ticket._id,
            order_id: ticket.order_id,
            movie: movie ? { movie_id: movie._id, title: movie.title } : null,
            room: room ? { room_id: room._id, name: room.name } : null,
            seat: seat ? { seat_id: seat._id, name: seat.name } : null
        };

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Lỗi khi lấy vé:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getTicketByUserId = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user_id: req.params.userid });
        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ error: { message: "Người dùng này không có vé nào" } });
        }
        return res.status(200).json(tickets);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: { message: "Vé không tồn tại" } });
        }
        return res.status(200).json({ message: "Xóa vé thành công" });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteTicketByOrderId = async (req, res) => {
    try {
        const result = await Ticket.deleteMany({ order_id: req.params.orderid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: { message: "Không có vé nào được tìm thấy để xóa" } });
        }
        return res.status(200).json({ message: `${result.deletedCount} vé đã được xóa.` });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteTicketByShowTimeId = async (req, res) => {
    try {
        const result = await Ticket.deleteMany({ showtime_id: req.params.showtimeid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: { message: "Không có vé nào được tìm thấy để xóa" } });
        }
        return res.status(200).json({ message: `${result.deletedCount} vé đã được xóa.` });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const updateTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ticket) {
            return res.status(404).json({ error: { message: "Vé không tồn tại" } });
        }
        return res.status(200).json(ticket);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

module.exports = {
    createTicket,
    updateTicketById,
    getAllTickets,
    deleteTicketById,
    getTicketById,
    getTicketByUserId,
    deleteTicketByOrderId,
    deleteTicketByShowTimeId
};