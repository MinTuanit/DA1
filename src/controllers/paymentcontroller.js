const Payment = require("../models/payment");

const createPayment = async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        return res.status(201).send(payment);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find();
        return res.status(201).send(payments);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            console.log("Thanh toán không tồn tại!");
            return res.status(404).send("Thanh toán không tồn tại");
        }
        return res.status(201).send(payment);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deletePaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) {
            console.log("Thanh toán không tồn tại!");
            return res.status(404).send("Thanh toán không tồn tại");
        }
        else return res.status(204).send("Xóa thanh toán thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updatePaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!payment) {
            console.log("Thanh toán không tồn tại!");
            return res.status(404).send("Thanh toán không tồn tại");
        }
        return res.status(200).send(payment);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createPayment,
    updatePaymentById,
    getAllPayments,
    deletePaymentById,
    getPaymentById
};