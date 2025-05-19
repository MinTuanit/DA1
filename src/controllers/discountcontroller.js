const Discount = require("../models/discount");

const createDiscount = async (req, res) => {
    try {
        const discount = await Discount.create(req.body);
        return res.status(201).send(discount);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find();
        return res.status(201).send(discounts);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            console.log("Khuyến mãi không tồn tại!");
            return res.status(404).send("Khuyến mãi không tồn tại");
        }
        return res.status(201).send(discount);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getDiscountByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const discount = await Discount.findOne({ code: code });

        if (!discount) {
            console.log("Khuyến mãi không tồn tại!");
            return res.status(404).send("Khuyến mãi không tồn tại");
        }

        return res.status(200).send(discount);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndDelete(req.params.id);
        if (!discount) {
            console.log("Khuyến mãi không tồn tại!");
            return res.status(404).send("Khuyến mãi không tồn tại");
        }
        else return res.status(204).send("Xóa khuyến mãi thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!discount) {
            console.log("Khuyến mãi không tồn tại!");
            return res.status(404).send("Khuyến mãi không tồn tại");
        }
        return res.status(200).send(discount);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
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