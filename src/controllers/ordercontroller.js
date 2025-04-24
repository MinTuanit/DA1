const Order = require("../models/order");

const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.status(201).send(order);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(201).send(orders);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            console.log("Hóa đơn không tồn tại!");
            return res.status(404).send("Hóa đơn không tồn tại");
        }
        res.status(201).send(order);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getOrderByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.params.userid });
        if (!orders || orders.length === 0) {
            console.log("Không có hóa đơn của người dùng này!");
            return res.status(404).send("Không có hóa đơn của người dùng này");
        }
        res.status(200).send(orders);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getOrderWithUserInfo = async (req, res) => {
    try {
        const order_id = req.params.orderid;

        const order = await Order.findById(order_id)
            .populate({
                path: 'user_id',
                select: 'full_name email dateOfBirth cccd phone'
            });

        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const formattedOrder = {
            _id: order._id,
            total_price: order.total_price,
            status: order.status,
            ordered_at: order.ordered_at,
            user: {
                user_id: order.user_id._id,
                full_name: order.user_id.full_name,
                email: order.user_id.email,
                dateOfBirth: order.user_id.dateOfBirth,
                cccd: order.user_id.cccd,
                phone: order.user_id.phone,
            }
        };

        res.json(formattedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const deleteOrderById = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            console.log("Hóa đơn không tồn tại!");
            return res.status(404).send("Hóa đơn không tồn tại");
        }
        else return res.status(204).send("Xóa hóa đơn thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteOrderByUserId = async (req, res) => {
    try {
        const result = await Order.deleteMany({ user_id: req.params.userid });
        if (result.deletedCount === 0) {
            console.log("Không có hóa đơn nào được tìm thấy để xóa!");
            return res.status(404).send("Không có hóa đơn nào được tìm thấy để xóa");
        }
        console.log(`${result.deletedCount} hóa đơn đã được xóa.`);
        res.status(200).send(`${result.deletedCount} hóa đơn đã được xóa.`);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateOrderById = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!order) {
            console.log("Hóa đơn không tồn tại!");
            return res.status(404).send("Hóa đơn không tồn tại");
        }
        res.status(200).send(order);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createOrder,
    updateOrderById,
    getAllOrders,
    deleteOrderById,
    getOrderById,
    getOrderByUserId,
    deleteOrderByUserId,
    getOrderWithUserInfo
};