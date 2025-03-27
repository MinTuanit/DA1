const Oderproduct = require("../models/orderproductdetail");

const createOderproduct = async (req, res) => {
    try {
        const Orderproduct = await Oderproduct.create(req.body);
        res.status(201).send(Orderproduct);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllOderproducts = async (req, res) => {
    try {
        const Orderproducts = await Oderproduct.find();
        res.status(201).send(Orderproducts);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getOderproductById = async (req, res) => {
    try {
        const Orderproduct = await Oderproduct.findById(req.params.id);
        if (!Orderproduct) {
            console.log("Hóa đơn chi tiết không tồn tại!");
            return res.status(404).send("Hóa đơn chi tiết không tồn tại");
        }
        res.status(201).send(Orderproduct);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getOrderproductByOrderId = async (req, res) => {
    try {
        const orderproducts = await Orderproduct.find({ order_id: req.params.orderid });
        if (!orderproducts || orderproducts.length === 0) {
            console.log("Không có hóa đơn chi tiết của hóa đơn này!");
            return res.status(404).send("Không có hóa đơn chi tiết của hóa đơn này");
        }
        res.status(200).send(orderproducts);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteOderproductById = async (req, res) => {
    try {
        const Orderproduct = await Oderproduct.findByIdAndDelete(req.params.id);
        if (!Orderproduct) {
            console.log("Hóa đơn chi tiết không tồn tại!");
            return res.status(404).send("Hóa đơn chi tiết không tồn tại");
        }
        else return res.status(204).send("Xóa hóa đơn chi tiết thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateOderproductById = async (req, res) => {
    try {
        const Orderproduct = await Oderproduct.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!Orderproduct) {
            console.log("Hóa đơn chi tiết không tồn tại!");
            return res.status(404).send("Hóa đơn chi tiết không tồn tại");
        }
        res.status(200).send(Orderproduct);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createOderproduct,
    updateOderproductById,
    getAllOderproducts,
    deleteOderproductById,
    getOderproductById
};