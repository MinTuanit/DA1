const Payment = require("../models/payment");

const createPayment = async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        return res.status(201).json(payment);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: 'discount_id',
                select: 'code'
            })
            .populate({
                path: 'order_id',
                select: 'code total_price'
            });

        if (!payments || payments.length === 0) {
            return res.status(404).json({ error: { message: "Không có thanh toán nào" } });
        }

        const formattedPayments = payments.map(payment => ({
            _id: payment._id,
            amount: payment.amount,
            payment_method: payment.payment_method,
            paid_at: payment.paid_at,
            order: payment.order_id ? {
                order_id: payment.order_id._id,
                code: payment.order_id.code,
                total_price: payment.order_id.total_price
            } : null,
            discount: payment.discount_id ? {
                discount_id: payment.discount_id._id,
                code: payment.discount_id.code
            } : null
        }));

        return res.status(200).json(formattedPayments);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate({
                path: 'discount_id',
                select: 'code'
            })
            .populate({
                path: 'order_id',
                select: 'code total_price'
            });

        if (!payment) {
            return res.status(404).json({ error: { message: "Thanh toán không tồn tại" } });
        }

        const formattedPayment = {
            _id: payment._id,
            amount: payment.amount,
            payment_method: payment.payment_method,
            paid_at: payment.paid_at,
            order: payment.order_id ? {
                order_id: payment.order_id._id,
                code: payment.order_id.code,
                total_price: payment.order_id.total_price
            } : null,
            discount: payment.discount_id ? {
                discount_id: payment.discount_id._id,
                code: payment.discount_id.code
            } : null
        };

        return res.status(200).json(formattedPayment);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deletePaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: { message: "Thanh toán không tồn tại" } });
        }
        return res.status(204).send();
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
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
            return res.status(404).json({ error: { message: "Thanh toán không tồn tại" } });
        }
        return res.status(200).json(payment);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

module.exports = {
    createPayment,
    updatePaymentById,
    getAllPayments,
    deletePaymentById,
    getPaymentById
};