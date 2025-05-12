const Order = require("../models/order");
const Payment = require("../models/payment");
const OrderProductDetail = require("../models/orderproductdetail");
const Ticket = require("../models/ticket");
const Product = require("../models/product");
const mongoose = require('mongoose');
const sendVerificationEmail = require('../utils/email');


const generateUniqueOrderCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let isDuplicate = true;

    while (isDuplicate) {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existing = await Order.findOne({ ordercode: code });
        if (!existing) {
            isDuplicate = false;
        }
    }
    return code;
};

const createOrder = async (req, res) => {
    try {
        const ordercode = await generateUniqueOrderCode();

        const newOrder = new Order({
            ordercode,
            total_price: req.body.total_price,
            status: req.body.status || 'pending',
            user_id: req.body.user_id,
        });
        await newOrder.save();
        return res.status(201).json(newOrder);
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        return res.status(500).json({ message: "Lỗi server!" });
    }
};

const createOrders = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { total_price, user_id, products, tickets, status, email, amount, payment_method, discount_id } = req.body;

        const ordercode = await generateUniqueOrderCode();
        const order = new Order({
            ordercode,
            total_price,
            user_id: user_id || null,
            status: status || 'pending',
            ordered_at: new Date()
        });

        await order.save({ session });

        if (products && products.length > 0) {
            const orderProducts = products.map(p => ({
                order_id: order._id,
                product_id: p.product_id,
                quantity: p.quantity,
            }));
            await OrderProductDetail.insertMany(orderProducts, { session });
        }

        if (tickets && tickets.length > 0) {
            const ticketDocs = tickets.map(t => ({
                order_id: order._id,
                showtime_id: t.showtime_id,
                seat_id: t.seat_id,
            }));
            await Ticket.insertMany(ticketDocs, { session });
        }

        if (amount && payment_method) {
            const payment = new Payment({
                order_id: order._id,
                amount,
                payment_method,
                discount_id: discount_id || null,
                status: 'completed',  
                paid_at: new Date()
            });
            await payment.save({ session });
        }

        if (email) {
            await sendVerificationEmail(email, ordercode);
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: 'Tạo hóa đơn thành công',
            order_id: order._id,
            ordercode
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({
            message: 'Lỗi khi tạo hóa đơn',
            error: error.message
        });
    }
};

const getTicketAndProductByOrderId = async (req, res) => {
    try {
        const order_id = req.params.orderid;

        const [ticketCount, productCount] = await Promise.all([
            Ticket.countDocuments({ order_id }),
            Product.countDocuments({ order_id })
        ]);
        return res.json({
            order_id,
            ticketCount,
            productCount
        });

    } catch (error) {
        console.error("Lỗi khi lấy thông tin hóa đơn:", error);
        return res.status(500).json({ message: "Lỗi server!" });
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        const ordersWithCounts = await Promise.all(
            orders.map(async (order) => {
                const [ticketCount, productCount] = await Promise.all([
                    Ticket.countDocuments({ order_id: order._id }),
                    Product.countDocuments({ order_id: order._id }),
                ]);

                return {
                    ...order.toObject(),
                    ticketCount,
                    productCount,
                };
            })
        );

        return res.status(200).json(ordersWithCounts);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
        return res.status(500).json({ message: "Lỗi server!" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            console.log("Hóa đơn không tồn tại!");
            return res.status(404).send("Hóa đơn không tồn tại");
        }
        return res.status(201).send(order);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getOrderByCode = async (req, res) => {
    try {
        const { ordercode } = req.params;
        const order = await Order.findOne({ ordercode });
        if (!order) {
            return res.status(404).json({ message: "Hóa đơn không tồn tại" });
        }

        const orderId = order._id;
        const tickets = await Ticket.find({ order_id: orderId })
            .populate({
                path: 'seat_id',
                select: 'seat_name seat_column'
            })
            .populate({
                path: 'showtime_id',
                populate: {
                    path: 'movie_id',
                    select: 'title'
                }
            });
        const products = await OrderProductDetail.find({ order_id: orderId })
            .populate({
                path: 'product_id',
                select: 'name'
            });

        const ticketInfo = tickets.map(t => ({
            seat: t.seat_id?.name || 'Không rõ',
            movie: t.showtime_id?.movie_id?.title || 'Không rõ',
            showtime: t.showtime_id?._id || null
        }));

        const productInfo = products.map(p => ({
            product: p.product_id?.name || 'Không rõ',
            quantity: p.quantity
        }));

        return res.status(200).json({
            ...order.toObject(),
            tickets: ticketInfo,
            products: productInfo
        });

    } catch (error) {
        console.error("Lỗi server: ", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

const getOrderWithInfoById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user_id', 'full_name phone')
            .lean();
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderProducts = await OrderProductDetail.find({ order_id: id })
            .populate('product_id', 'name price category')
            .lean();

        const products = orderProducts.map(op => ({
            product_id: op.product_id._id,
            name: op.product_id.name,
            price: op.product_id.price,
            category: op.product_id.category,
            quantity: op.quantity
        }));

        const tickets = await Ticket.find({ order_id: id })
            .populate([
                { path: 'showtime_id', select: 'start_time movie_id', populate: { path: 'movie_id', select: 'title' } },
                { path: 'seat_id', select: 'seat_name seat_column' }
            ])
            .lean();

        const ticketDetails = tickets.map(t => ({
            ticket_id: t._id,
            showtime: {
                showtime_id: t.showtime_id._id,
                start_time: t.showtime_id.start_time,
                movie_title: t.showtime_id.movie_id.title,
            },
            seat: {
                seat_id: t.seat_id._id,
                seat_row: t.seat_id.seat_name,
                seat_number: t.seat_id.seat_column
            }
        }));

        return res.status(200).json({
            order: {
                order_id: order._id,
                total_price: order.total_price,
                status: order.status,
                ordered_at: order.ordered_at,
                user: {
                    user_id: order.user_id._id,
                    full_name: order.user_id.full_name,
                    phone: order.user_id.phone
                }
            },
            products,
            tickets: ticketDetails
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi lấy hóa đơn', error: error.message });
    }
}

const getOrderByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.params.userid });
        if (!orders || orders.length === 0) {
            console.log("Không có hóa đơn của người dùng này!");
            return res.status(404).send("Không có hóa đơn của người dùng này");
        }
        return res.status(200).send(orders);
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

        return res.json(formattedOrder);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi server" });
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
        return res.status(200).send(`${result.deletedCount} hóa đơn đã được xóa.`);
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
        return res.status(200).send(order);
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
    getOrderWithUserInfo,
    createOrders,
    getOrderWithInfoById,
    getTicketAndProductByOrderId,
    getOrderByCode,
};