const OrderProductDetail = require("../models/orderproductdetail");

const createOrderProduct = async (req, res) => {
    try {
        const newOrderProduct = await OrderProductDetail.create(req.body);
        return res.status(201).json(newOrderProduct);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getAllOrderProducts = async (req, res) => {
    try {
        const orderProducts = await OrderProductDetail.find();
        return res.status(200).json(orderProducts);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getOrderProductById = async (req, res) => {
    try {
        const orderProduct = await OrderProductDetail.findById(req.params.id);
        if (!orderProduct) {
            return res.status(404).json({ error: { message: "Hóa đơn chi tiết không tồn tại" } });
        }
        return res.status(200).json(orderProduct);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const getOrderProductsByOrderId = async (req, res) => {
    try {
        const orderProducts = await OrderProductDetail.find({ order_id: req.params.orderid });
        if (!orderProducts || orderProducts.length === 0) {
            return res.status(404).json({ error: { message: "Không có hóa đơn chi tiết của hóa đơn này" } });
        }
        return res.status(200).json(orderProducts);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteOrderProductById = async (req, res) => {
    try {
        const deleted = await OrderProductDetail.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: { message: "Hóa đơn chi tiết không tồn tại" } });
        }
        return res.status(204).send(); // Không cần nội dung
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const updateOrderProductById = async (req, res) => {
    try {
        const updated = await OrderProductDetail.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ error: { message: "Hóa đơn chi tiết không tồn tại" } });
        }
        return res.status(200).json(updated);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

module.exports = {
    createOrderProduct,
    getAllOrderProducts,
    getOrderProductById,
    getOrderProductsByOrderId,
    deleteOrderProductById,
    updateOrderProductById
};