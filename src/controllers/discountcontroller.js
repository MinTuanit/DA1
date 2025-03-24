const Discount = require("../models/discount");


const createDiscount = async (req, res) => {
    try {
        const discount = await Discount.create(req.body);
        res.status(201).send(discount);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find();
        res.status(201).send(discounts);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) {
            console.log("Sản phẩm không tồn tại!");
            return res.status(404).send("Sản phẩm không tồn tại");
        }
        res.status(201).send(discount);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteDiscountById = async (req, res) => {
    try {
        const discount = await Discount.findByIdAndDelete(req.params.id);
        if (!discount) {
            console.log("Sản phẩm không tồn tại!");
            return res.status(404).send("Sản phẩm không tồn tại");
        }
        else return res.status(204).send("Xóa sản phẩm thành công");
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
            console.log("Sản phẩm không tồn tại!");
            return res.status(404).send("Sản phẩm không tồn tại");
        }
        res.status(200).send(discount);
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
    getDiscountById
};