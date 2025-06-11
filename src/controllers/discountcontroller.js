const Discount = require("../models/discount");

const createDiscount = async (req, res) => {
    try {
        const discount = await Discount.create(req.body);
        return res.status(201).json(discount);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find();
        return res.status(200).json(discounts);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            return res.status(404).json({ error: { message: "Khuyến mãi không tồn tại" } });
        }
        return res.status(200).json(discount);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getDiscountByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const discount = await Discount.findOne({ code });

        if (!discount) {
            return res.status(404).json({ error: { message: "Khuyến mãi không tồn tại" } });
        }

        return res.status(200).json(discount);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const deleteDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndDelete(req.params.id);
        if (!discount) {
            return res.status(404).json({ error: { message: "Khuyến mãi không tồn tại" } });
        }
        return res.status(200).json({ message: "Xóa khuyến mãi thành công" });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const updateDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!discount) {
            return res.status(404).json({ error: { message: "Khuyến mãi không tồn tại" } });
        }
        return res.status(200).json(discount);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

module.exports = {
    createDiscount,
    updateDiscountById,
    getAllDiscounts,
    deleteDiscountById,
    getDiscountById,
    getDiscountByCode
};