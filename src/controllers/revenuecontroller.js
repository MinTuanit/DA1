const Showtime = require("../models/showtime");
const Ticket = require("../models/ticket");
const Order = require("../models/order");
const Movie = require("../models/movie");
const Payment = require("../models/payment");
const OrderProductDetail = require("../models/orderproductdetail");
const mongoose = require("mongoose");
const Product = require('../models/product');
const Discount = require('../models/discount');

const getAll = async (req, res) => {
    try {
        const payments = await Payment.find();
        const total_revenue = payments.reduce((sum, p) => sum + p.amount, 0);
        return res.status(200).json({ total_revenue });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getAllRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: { message: "Ngày không hợp lệ" } });
        }

        const tickets = await Ticket.find()
            .populate({ path: 'order_id', match: { ordered_at: { $gte: start, $lte: end } } })
            .populate({ path: 'showtime_id', populate: { path: 'movie_id' } });

        const validTickets = tickets.filter(t => t.order_id && t.showtime_id);

        const movieSales = {};
        validTickets.forEach(ticket => {
            const movie = ticket.showtime_id.movie_id;
            if (!movie?.title) return;
            movieSales[movie.title] = (movieSales[movie.title] || 0) + 1;
        });

        const ticketRevenue = validTickets.reduce((sum, t) => sum + t.showtime_id.price, 0);
        const ticketCount = validTickets.length;

        const payments = await Payment.find({ paid_at: { $gte: start, $lte: end } });
        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const productRevenue = totalRevenue - ticketRevenue;

        const orderProductDetails = await OrderProductDetail.find()
            .populate({ path: 'order_id', match: { ordered_at: { $gte: start, $lte: end } } })
            .populate('product_id');

        const validOrderProducts = orderProductDetails.filter(opd => opd.order_id && opd.product_id);

        const productSales = {};
        const totalProductQuantity = validOrderProducts.reduce((sum, item) => {
            productSales[item.product_id.name] = (productSales[item.product_id.name] || 0) + item.quantity;
            return sum + item.quantity;
        }, 0);

        return res.status(200).json({
            ticketRevenue,
            productRevenue,
            ticketCount,
            totalProductQuantity,
            totalRevenue,
            productSales,
            movieSales
        });
    } catch (error) {
        console.error("Lỗi khi thống kê doanh thu:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getRevenueReport = async (req, res) => {
    try {
        let { startDate, endDate, movie_id, product_id } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: { message: "Ngày không hợp lệ" } });
        }

        if (movie_id && (!mongoose.Types.ObjectId.isValid(movie_id) || !(await Movie.exists({ _id: movie_id })))) {
            return res.status(404).json({ error: { message: "Phim không tồn tại hoặc ID không hợp lệ" } });
        }

        if (product_id && (!mongoose.Types.ObjectId.isValid(product_id) || !(await Product.exists({ _id: product_id })))) {
            return res.status(404).json({ error: { message: "Sản phẩm không tồn tại hoặc ID không hợp lệ" } });
        }

        const tickets = await Ticket.find()
            .populate({ path: 'order_id', match: { ordered_at: { $gte: start, $lte: end } } })
            .populate({ path: 'showtime_id', populate: { path: 'movie_id' } });

        const validTickets = tickets.filter(t => t.order_id && t.showtime_id);
        const filteredTickets = movie_id
            ? validTickets.filter(t => t.showtime_id.movie_id?._id.toString() === movie_id)
            : validTickets;

        const ticketRevenue = filteredTickets.reduce((sum, t) => sum + t.showtime_id.price, 0);
        const ticketCount = filteredTickets.length;

        const orderProductDetails = await OrderProductDetail.find()
            .populate({ path: 'order_id', match: { ordered_at: { $gte: start, $lte: end } } })
            .populate('product_id');

        let validOrderProducts = orderProductDetails.filter(opd => opd.order_id && opd.product_id);
        if (product_id) {
            validOrderProducts = validOrderProducts.filter(opd => opd.product_id._id.toString() === product_id);
        }

        const totalProductQuantity = validOrderProducts.reduce((sum, item) => sum + item.quantity, 0);
        const productSales = {};
        validOrderProducts.forEach(item => {
            productSales[item.product_id.name] = (productSales[item.product_id.name] || 0) + item.quantity;
        });

        const response = {};
        if (product_id) {
            response.product = {
                name: validOrderProducts[0]?.product_id?.name || 'Unknown',
                quantity: totalProductQuantity
            };
        }

        if (movie_id) {
            response.movie = {
                name: filteredTickets[0]?.showtime_id?.movie_id?.title || 'Unknown',
                ticketCount,
                revenue: ticketRevenue
            };
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error("Lỗi khi thống kê doanh thu:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getDailyTicketRevenueByMovie = async (req, res) => {
    try {
        const { movie_id, startDate, endDate } = req.body;

        if (!movie_id || !startDate || !endDate) {
            return res.status(400).json({ error: { message: "Thiếu movie_id hoặc khoảng thời gian" } });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const allTickets = await Ticket.find()
            .populate({ path: 'order_id', match: { ordered_at: { $gte: start, $lte: end } } })
            .populate({ path: 'showtime_id', populate: { path: 'movie_id' } });

        const validTickets = allTickets.filter(t =>
            t.order_id && t.showtime_id?.movie_id?._id.toString() === movie_id
        );

        const dayResults = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayStart = new Date(d.setHours(0, 0, 0, 0));
            const dayEnd = new Date(d.setHours(23, 59, 59, 999));

            const dayTickets = validTickets.filter(t => {
                const orderedAt = new Date(t.order_id.ordered_at);
                return orderedAt >= dayStart && orderedAt <= dayEnd;
            });

            const ticketRevenue = dayTickets.reduce((sum, t) => sum + t.showtime_id.price, 0);
            const ticketCount = dayTickets.length;

            dayResults.push({
                date: dayStart.toLocaleDateString('en-CA'),
                ticketRevenue,
                ticketCount
            });
        }

        return res.status(200).json(dayResults);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

const getDailyProductSalesByProduct = async (req, res) => {
    try {
        const { product_id, startDate, endDate } = req.body;

        if (!product_id || !startDate || !endDate) {
            return res.status(400).json({ error: { message: "Thiếu product_id hoặc khoảng thời gian" } });
        }

        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({ error: { message: "Không tìm thấy sản phẩm" } });
        }

        const price = product.price;

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const allOrderProducts = await OrderProductDetail.find()
            .populate({ path: 'order_id', match: { ordered_at: { $gte: start, $lte: end } } })
            .populate('product_id');

        const validOrderProducts = allOrderProducts.filter(opd =>
            opd.order_id && opd.product_id?._id.toString() === product_id
        );

        const dayResults = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayStart = new Date(d.setHours(0, 0, 0, 0));
            const dayEnd = new Date(d.setHours(23, 59, 59, 999));

            const dayProducts = validOrderProducts.filter(opd => {
                const orderedAt = new Date(opd.order_id.ordered_at);
                return orderedAt >= dayStart && orderedAt <= dayEnd;
            });

            const totalProductQuantity = dayProducts.reduce((sum, item) => sum + item.quantity, 0);
            const productRevenue = totalProductQuantity * price;

            dayResults.push({
                date: dayStart.toLocaleDateString('en-CA'),
                totalProductQuantity,
                productRevenue
            });
        }

        return res.status(200).json(dayResults);
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ error: { message: "Lỗi Server" } });
    }
};

module.exports = {
    getAll,
    getRevenueReport,
    getAllRevenueReport,
    getDailyTicketRevenueByMovie,
    getDailyProductSalesByProduct
};