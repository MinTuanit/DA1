const Order = require("../models/order");
const Payment = require("../models/payment");
const Cinemas = require('../models/cinema');
const Discount = require("../models/discount");
const OrderProductDetail = require("../models/orderproductdetail");
const Ticket = require("../models/ticket");
const Showtime = require("../models/showtime");
const Seat = require("../models/seat");
const Product = require("../models/product");
const mongoose = require('mongoose');
const sendOrderConfirmationEmail = require('../utils/email');
const path = require('path');
const formatDate = require("../utils/formatdate");
const puppeteer = require('puppeteer');
const generateOrderHtml = require('../utils/generateOrderHtml');

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
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const createOrders = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const {
            total_price, user_id, products, tickets,
            status, email, amount, payment_method, discount_id
        } = req.body;

        const ordercode = await generateUniqueOrderCode();

        if (tickets && tickets.seats.length > 0) {
            const existingTicket = await Ticket.find({
                showtime_id: tickets.showtime_id,
                seat_id: { $in: tickets.seats.map(seat => seat.seat_id) }
            });
            if (existingTicket.length > 0) {
                return res.status(409).json({ error: { message: 'Ghế đã được đặt chỗ.' } });
            }
        }

        const order = new Order({
            ordercode,
            total_price,
            user_id: user_id || null,
            status: status || 'completed',
            ordered_at: new Date()
        });
        await order.save({ session });

        if (products?.length > 0) {
            const orderProducts = products.map(p => ({
                order_id: order._id,
                product_id: p.product_id,
                quantity: p.quantity,
            }));
            await OrderProductDetail.insertMany(orderProducts, { session });
        }

        if (tickets?.seats.length > 0) {
            const ticketDocs = tickets.seats.map(s => ({
                order_id: order._id,
                showtime_id: tickets.showtime_id,
                seat_id: s.seat_id,
            }));
            await Ticket.insertMany(ticketDocs, { session });
        }

        if (amount && payment_method) {
            const payment = new Payment({
                order_id: order._id,
                amount,
                payment_method,
                discount_id: discount_id || null,
                paid_at: new Date()
            });
            await payment.save({ session });

            if (discount_id) {
                await Discount.findByIdAndUpdate(
                    discount_id,
                    { $inc: { remaining: -1 } },
                    { session }
                );
            }
        }

        await session.commitTransaction();

        const [populatedTickets, populatedProducts] = await Promise.all([
            Ticket.find({ order_id: order._id })
                .populate({ path: 'seat_id', select: 'seat_name seat_column' })
                .populate({
                    path: 'showtime_id',
                    select: 'price showtime',
                    populate: [
                        { path: 'movie_id', select: 'title' },
                        {
                            path: 'room_id',
                            select: 'name cinema_id',
                            populate: { path: 'cinema_id', select: 'name address' }
                        }
                    ]
                }),
            OrderProductDetail.find({ order_id: order._id })
                .populate({ path: 'product_id', select: 'name' })
        ]);

        if (email) {
            try {
                const showtime = populatedTickets[0]?.showtime_id;
                const cinemaName = showtime?.room_id?.cinema_id?.name;
                const movieName = showtime?.movie_id?.title;
                const simplifiedTickets = populatedTickets.map(t => ({
                    seat_name: t.seat_id?.seat_name,
                    price: t.showtime_id?.price,
                }));
                await sendOrderConfirmationEmail({
                    toEmail: email,
                    ordercode,
                    tickets: simplifiedTickets,
                    totalPrice: total_price,
                    showtime: {
                        datetime: showtime?.showtime,
                        room_name: showtime?.room_id?.name
                    },
                    cinemaName,
                    movieName
                });
            } catch (emailErr) {
                console.error("Lỗi khi gửi email xác nhận:", emailErr.message);
            }
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=hoadon_${ordercode}.pdf`);

        // --- Puppeteer PDF generation ---
        const html = generateOrderHtml({
            ordercode,
            ordered_at: formatDate(order.ordered_at),
            total_price,
            populatedTickets,
            populatedProducts
        });
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();
        res.end(pdfBuffer);
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Lỗi khi tạo hóa đơn:", error);
        return res.status(500).json({ error: { message: "Lỗi khi tạo hóa đơn" } });
    } finally {
        session.endSession();
    }
};

const getTicketAndProductByOrderId = async (req, res) => {
    try {
        const order_id = req.params.orderid;

        const [ticketCount, productCount] = await Promise.all([
            Ticket.countDocuments({ order_id }),
            Product.countDocuments({ order_id })
        ]);

        return res.json({ order_id, ticketCount, productCount });
    } catch (error) {
        console.error("Lỗi khi lấy thông tin hóa đơn:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();

        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const [tickets, orderProducts] = await Promise.all([
                    Ticket.find({ order_id: order._id })
                        .populate({ path: 'showtime_id', populate: { path: 'movie_id', model: 'Movies' } })
                        .populate('seat_id'),
                    OrderProductDetail.find({ order_id: order._id })
                        .populate({ path: 'product_id', model: 'Products' })
                ]);

                const ticketDetails = tickets.map(ticket => ({
                    title: ticket.showtime_id?.movie_id?.title || '',
                    showtime: ticket.showtime_id?.showtime || '',
                    price: ticket.showtime_id?.price || 0,
                    seats: [
                        {
                            seat_id: ticket.seat_id?._id,
                            seat_name: ticket.seat_id?.seat_name || ''
                        }
                    ]
                }));

                const productDetails = orderProducts.map(product => ({
                    product_id: product.product_id?._id || null,
                    name: product.product_id?.name || '',
                    price: product.product_id?.price || '',
                    quantity: product.quantity,
                    total: product.product_id?.price * product.quantity || 0
                }));

                return {
                    ...order.toObject(),
                    ticketCount: tickets.length,
                    productCount: orderProducts.length,
                    tickets: ticketDetails.length > 0 ? {
                        title: ticketDetails[0].title,
                        showtime: ticketDetails[0].showtime,
                        price: ticketDetails[0].price,
                        seats: ticketDetails.flatMap(t => t.seats || []),
                    } : null,
                    products: productDetails
                };
            })
        );

        return res.status(200).json(ordersWithDetails);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách hóa đơn:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: { message: 'Không tìm thấy đơn hàng' } });
        }

        const [tickets, orderProducts] = await Promise.all([
            Ticket.find({ order_id: order._id })
                .populate({ path: 'showtime_id', populate: { path: 'movie_id', model: 'Movies' } })
                .populate('seat_id'),
            OrderProductDetail.find({ order_id: order._id })
                .populate({ path: 'product_id', model: 'Products' })
        ]);

        const ticketDetails = tickets.map(ticket => ({
            title: ticket.showtime_id?.movie_id?.title || '',
            showtime: ticket.showtime_id?.showtime || '',
            price: ticket.showtime_id?.price || 0,
            seats: [
                {
                    seat_id: ticket.seat_id?._id,
                    seat_name: ticket.seat_id?.seat_name || ''
                }
            ]
        }));

        const productDetails = orderProducts.map(product => ({
            product_id: product.product_id?._id || null,
            name: product.product_id?.name || '',
            quantity: product.quantity
        }));

        const orderDetail = {
            ...order.toObject(),
            ticketCount: tickets.length,
            productCount: orderProducts.length,
            tickets: ticketDetails,
            products: productDetails
        };

        return res.status(200).json(orderDetail);
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getOrderByCode = async (req, res) => {
    try {
        const { ordercode } = req.params;
        const order = await Order.findOne({ ordercode });
        if (!order) {
            return res.status(404).json({ error: { message: "Hóa đơn không tồn tại" } });
        }

        const [tickets, products] = await Promise.all([
            Ticket.find({ order_id: order._id })
                .populate({ path: 'seat_id', select: 'seat_name seat_column' })
                .populate({
                    path: 'showtime_id',
                    populate: [
                        { path: 'movie_id', select: 'title' },
                        {
                            path: 'room_id',
                            select: 'name cinema_id',
                            populate: { path: 'cinema_id', select: 'name address' }
                        }
                    ]
                }),
            OrderProductDetail.find({ order_id: order._id })
                .populate({ path: 'product_id', select: 'name' })
        ]);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=hoadon_${ordercode}.pdf`);

        // --- Puppeteer PDF generation ---
        const html = generateOrderHtml({
            ordercode,
            ordered_at: formatDate(order.ordered_at),
            total_price: order.total_price,
            populatedTickets: tickets,
            populatedProducts: products
        });
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();
        res.end(pdfBuffer);
    } catch (error) {
        console.error("Lỗi khi tạo hóa đơn:", error);
        return res.status(500).json({ error: { message: "Lỗi khi tạo hóa đơn" } });
    }
};

const getOrderWithInfoById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user_id', 'full_name phone')
            .lean();

        if (!order) {
            return res.status(404).json({ error: { message: 'Hóa đơn không tồn tại' } });
        }

        const [orderProducts, tickets] = await Promise.all([
            OrderProductDetail.find({ order_id: id })
                .populate('product_id', 'name price category')
                .lean(),
            Ticket.find({ order_id: id })
                .populate([
                    {
                        path: 'showtime_id',
                        select: 'start_time movie_id',
                        populate: { path: 'movie_id', select: 'title' }
                    },
                    { path: 'seat_id', select: 'seat_name seat_column' }
                ])
                .lean()
        ]);

        const products = orderProducts.map(p => ({
            product_id: p.product_id._id,
            name: p.product_id.name,
            price: p.product_id.price,
            category: p.product_id.category,
            quantity: p.quantity
        }));

        const ticketDetails = tickets.map(t => ({
            ticket_id: t._id,
            showtime: {
                showtime_id: t.showtime_id._id,
                start_time: t.showtime_id.start_time,
                movie_title: t.showtime_id.movie_id.title
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
        console.error("Lỗi khi lấy hóa đơn:", error);
        return res.status(500).json({ error: { message: "Lỗi khi lấy hóa đơn" } });
    }
};

const getOrderByUserId = async (req, res) => {
    try {
        const userId = req.params.userid;

        const orders = await Order.find({ user_id: userId });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: { message: "Hóa đơn không tồn tại" } });
        }

        const detailedOrders = await Promise.all(
            orders.map(async (order) => {
                const [tickets, orderProducts] = await Promise.all([
                    Ticket.find({ order_id: order._id })
                        .populate({
                            path: 'showtime_id',
                            populate: {
                                path: 'movie_id',
                                model: 'Movies'
                            }
                        })
                        .populate('seat_id'),

                    OrderProductDetail.find({ order_id: order._id })
                        .populate({
                            path: 'product_id',
                            model: 'Products'
                        })
                ]);

                const ticketDetails = tickets.map(ticket => ({
                    title: ticket.showtime_id?.movie_id?.title || '',
                    showtime: ticket.showtime_id?.showtime || '',
                    price: ticket.showtime_id?.price || 0,
                    seats: [
                        {
                            seat_id: ticket.seat_id?._id,
                            seat_name: ticket.seat_id?.seat_name || ''
                        }
                    ]
                }));

                const productDetails = orderProducts.map(product => ({
                    product_id: product.product_id?._id || null,
                    name: product.product_id?.name || '',
                    quantity: product.quantity
                }));

                return {
                    ...order.toObject(),
                    ticketCount: tickets.length,
                    productCount: orderProducts.length,
                    tickets: ticketDetails,
                    products: productDetails
                };
            })
        );

        return res.status(200).json(detailedOrders);
    } catch (error) {
        console.error("Lỗi khi lấy hóa đơn theo user_id:", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
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
            return res.status(404).json({ error: { message: "Hóa đơn không tồn tại" } });
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
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteOrderById = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            console.log("Hóa đơn không tồn tại!");
            return res.status(404).json({ error: { message: "Hóa đơn không tồn tại" } });
        }
        else return res.status(204).json("Xóa hóa đơn thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const deleteOrderByUserId = async (req, res) => {
    try {
        const result = await Order.deleteMany({ user_id: req.params.userid });
        if (result.deletedCount === 0) {
            console.log("Không có hóa đơn nào được tìm thấy để xóa!");
            return res.status(404).json({ error: { message: "Không có hóa đơn nào được tìm thấy để xóa!" } });
        }
        console.log(`${result.deletedCount} hóa đơn đã được xóa.`);
        return res.status(200).send(`${result.deletedCount} hóa đơn đã được xóa.`);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
    }
};

const updateOrderById = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const orderId = req.params.id;

        const existingOrder = await Order.findById(orderId).session(session);
        if (!existingOrder) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: { message: "Hóa đơn không tồn tại" } });
        }

        if (existingOrder.status !== "pending") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                error:
                    { message: `Không thể cập nhật đơn hàng với trạng thái "${existingOrder.status}"` }
            });
        }

        const allowedUpdates = [
            "user_id",
            "total_price",
            "status",
            "email",
            "products",
            "tickets",
            "amount",
            "payment_method",
            "discount_id"
        ];

        const updates = {};
        for (const key of allowedUpdates) {
            if (key in req.body) {
                updates[key] = req.body[key];
            }
        }

        Object.assign(existingOrder, updates);
        await existingOrder.save({ session });

        if (("amount" in updates) && ("payment_method" in updates)) {
            const payment = await Payment.findOne({ order_id: orderId }).session(session);
            if (payment) {
                payment.amount = updates.amount;
                payment.payment_method = updates.payment_method;
                payment.discount_id = updates.discount_id || null;
                payment.paid_at = new Date();
                await payment.save({ session });
            } else {
                const newPayment = new Payment({
                    order_id: orderId,
                    amount: updates.amount,
                    payment_method: updates.payment_method,
                    discount_id: updates.discount_id || null,
                    paid_at: new Date()
                });
                await newPayment.save({ session });
            }

            if (updates.discount_id) {
                await Discount.findByIdAndUpdate(
                    updates.discount_id,
                    { $inc: { max_usage: -1 } },
                    { session }
                );
            }
        }

        if ("products" in updates) {
            await OrderProductDetail.deleteMany({ order_id: orderId }).session(session);
            const orderProducts = updates.products.map(p => ({
                order_id: orderId,
                product_id: p.product_id,
                quantity: p.quantity,
            }));
            await OrderProductDetail.insertMany(orderProducts, { session });
        }

        if ("tickets" in updates) {
            await Ticket.deleteMany({ order_id: orderId }).session(session);

            const ticketDocs = updates.tickets.map(t => ({
                order_id: orderId,
                showtime_id: t.showtime_id,
                seat_id: t.seat_id,
            }));
            await Ticket.insertMany(ticketDocs, { session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ message: "Cập nhật đơn hàng thành công", order: existingOrder });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).json({ error: { message: "Lỗi server" } });
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