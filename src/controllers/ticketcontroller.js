const Ticket = require("../models/ticket");

const createTicket = async (req, res) => {
    try {
        const ticket = await Ticket.create(req.body);
        res.status(201).send(ticket);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.status(201).send(tickets);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            console.log("Vé không tồn tại!");
            return res.status(404).send("Vé không tồn tại");
        }
        res.status(201).send(ticket);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getTicketByUserId = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user_id: req.params.userid });
        if (!tickets || tickets.length === 0) {
            console.log("Người dùng này không có vé nào!");
            return res.status(404).send("Người dùng này không có vé nào!");
        }
        res.status(200).send(tickets);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};


const deleteTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            console.log("Vé không tồn tại!");
            return res.status(404).send("Vé không tồn tại");
        }
        else return res.status(204).send("Xóa vé thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteTicketByOrderId = async (req, res) => {
    try {
        const result = await Ticket.deleteMany({ order_id: req.params.orderid });
        if (result.deletedCount === 0) {
            console.log("Không có vé nào được tìm thấy để xóa!");
            return res.status(404).send("Không có vé nào được tìm thấy để xóa");
        }
        console.log(`${result.deletedCount} vé đã được xóa.`);
        res.status(200).send(`${result.deletedCount} vé đã được xóa.`);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteTicketByShowTimeId = async (req, res) => {
    try {
        const result = await Ticket.deleteMany({ showtime_id: req.params.showtimeid });
        if (result.deletedCount === 0) {
            console.log("Không có vé nào được tìm thấy để xóa!");
            return res.status(404).send("Không có vé nào được tìm thấy để xóa");
        }
        console.log(`${result.deletedCount} vé đã được xóa.`);
        res.status(200).send(`${result.deletedCount} vé đã được xóa.`);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!ticket) {
            console.log("Vé không tồn tại!");
            return res.status(404).send("Vé không tồn tại");
        }
        res.status(200).send(ticket);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
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