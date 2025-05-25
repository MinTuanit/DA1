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
        let total_revenue = 0;
        payments.forEach(p => {
            total_revenue += p.amount;
        });
        const t = {
            total_revenue: total_revenue
        }
        return res.status(200).send(t);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Validate ngày
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid startDate or endDate" });
        }

        // --- Vé ---
        const tickets = await Ticket.find()
            .populate({
                path: 'order_id',
                match: { ordered_at: { $gte: start, $lte: end } }
            })
            .populate({
                path: 'showtime_id',
                populate: {
                    path: 'movie_id'
                }
            });

        const validTickets = tickets.filter(t => t.order_id && t.showtime_id);
        let movieSales = {};
        validTickets.forEach(ticket => {
            const movie = ticket.showtime_id.movie_id;
            if (!movie || !movie.title) return;

            const movieName = movie.title;
            if (!movieSales[movieName]) {
                movieSales[movieName] = 0;
            }
            movieSales[movieName] += 1;
        });

        let ticketRevenue = 0;
        validTickets.forEach(ticket => {
            ticketRevenue += ticket.showtime_id.price;
        });

        const ticketCount = validTickets.length;

        // --- Thanh toán ---
        const payments = await Payment.find({
            paid_at: { $gte: start, $lte: end }
        });

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        const productRevenue = totalRevenue - ticketRevenue;

        // --- Sản phẩm đồ ăn ---
        const orderProductDetails = await OrderProductDetail.find()
            .populate({
                path: 'order_id',
                match: { ordered_at: { $gte: start, $lte: end } }
            })
            .populate('product_id');

        const validOrderProducts = orderProductDetails.filter(opd => opd.order_id && opd.product_id);

        const totalProductQuantity = validOrderProducts.reduce((sum, item) => sum + item.quantity, 0);

        // Nhóm theo tên sản phẩm
        const productSales = {};

        validOrderProducts.forEach(item => {
            const name = item.product_id.name;
            if (!productSales[name]) {
                productSales[name] = 0;
            }
            productSales[name] += item.quantity;
        });

        return res.status(200).json({
            ticketRevenue,
            productRevenue,
            ticketCount,
            totalProductQuantity,
            totalRevenue,
            productSales,
            movieSales
        });
    } catch (err) {
        console.error("Lỗi khi thống kê doanh thu:", err);
        res.sendStatus(500);
    }
};



const getRevenueReport = async (req, res) => {
    try {
        let { startDate, endDate, movie_id, product_id } = req.body;

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: "Invalid startDate or endDate" });
        }

        // --- Kiểm tra movie_id ---
        if (movie_id) {
            if (!mongoose.Types.ObjectId.isValid(movie_id)) {
                return res.status(400).json({ error: "Invalid movie_id format" });
            }
            const movieExists = await Movie.exists({ _id: movie_id });
            if (!movieExists) {
                return res.status(404).json({ error: "Phim không tồn tại" });
            }
        }

        // --- Kiểm tra product_id ---
        if (product_id) {
            if (!mongoose.Types.ObjectId.isValid(product_id)) {
                return res.status(400).json({ error: "Invalid product_id format" });
            }
            const productExists = await Product.exists({ _id: product_id });
            if (!productExists) {
                return res.status(404).json({ error: "Sản phẩm không tồn tại" });
            }
        }

        // --- Vé ---
        let tickets = await Ticket.find()
            .populate({
                path: 'order_id',
                match: { ordered_at: { $gte: start, $lte: end } }
            })
            .populate({
                path: 'showtime_id',
                populate: { path: 'movie_id' }
            });

        const validTickets = tickets.filter(t => t.order_id && t.showtime_id);

        // Lọc vé theo movie_id nếu có
        const filteredTickets = movie_id
            ? validTickets.filter(t => t.showtime_id.movie_id && t.showtime_id.movie_id._id.toString() === movie_id)
            : validTickets;

        let ticketRevenue = 0;
        filteredTickets.forEach(ticket => {
            ticketRevenue += ticket.showtime_id.price;
        });
        const ticketCount = filteredTickets.length;

        // --- Sản phẩm đồ ăn ---
        let orderProductDetails = await OrderProductDetail.find()
            .populate({
                path: 'order_id',
                match: { ordered_at: { $gte: start, $lte: end } }
            })
            .populate('product_id');

        let validOrderProducts = orderProductDetails.filter(opd => opd.order_id && opd.product_id);

        // Lọc theo product_id nếu có
        if (product_id) {
            validOrderProducts = validOrderProducts.filter(opd => opd.product_id._id.toString() === product_id);
        }

        const totalProductQuantity = validOrderProducts.reduce((sum, item) => sum + item.quantity, 0);

        const productSales = {};
        validOrderProducts.forEach(item => {
            const name = item.product_id.name;
            if (!productSales[name]) {
                productSales[name] = 0;
            }
            productSales[name] += item.quantity;
        });

        const response = {
        };

        if (product_id) {
            const productName = validOrderProducts[0]?.product_id?.name || 'Unknown';
            response.product = {
                name: productName,
                quantity: totalProductQuantity
            };
        }

        if (movie_id) {
            const movieName = filteredTickets[0]?.showtime_id?.movie_id?.title || 'Unknown';
            response.movie = {
                name: movieName,
                ticketCount: ticketCount,
                revenue: ticketRevenue
            };
        }

        return res.status(200).json(response);

    } catch (err) {
        console.error("Lỗi khi thống kê doanh thu:", err);
        res.sendStatus(500);
    }
};

const getDailyTicketRevenueByMovie = async (req, res) => {
    const { movie_id, startDate, endDate } = req.body;

    if (!movie_id || !startDate || !endDate) {
        return res.status(400).json({ error: "Thiếu movie_id hoặc khoảng thời gian" });
    }

    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    const allTickets = await Ticket.find()
        .populate({
            path: 'order_id',
            match: { ordered_at: { $gte: start, $lte: end } }
        })
        .populate({
            path: 'showtime_id',
            populate: { path: 'movie_id' }
        });

    const validTickets = allTickets.filter(t =>
        t.order_id && t.showtime_id && t.showtime_id.movie_id &&
        t.showtime_id.movie_id._id.toString() === movie_id
    );

    const dayResults = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        const dayEnd = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        dayEnd.setHours(23, 59, 59, 999);

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
};

const getDailyProductSalesByProduct = async (req, res) => {
    const { product_id, startDate, endDate } = req.body;

    if (!product_id || !startDate || !endDate) {
        return res.status(400).json({ error: "Thiếu product_id hoặc khoảng thời gian" });
    }

    const product = await Product.findById(product_id);
    if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    const price = product.price;

    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    const allOrderProducts = await OrderProductDetail.find()
        .populate({
            path: 'order_id',
            match: { ordered_at: { $gte: start, $lte: end } }
        })
        .populate('product_id');

    const validOrderProducts = allOrderProducts.filter(opd =>
        opd.order_id &&
        opd.product_id &&
        opd.product_id._id.toString() === product_id
    );

    const dayResults = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayStart = new Date(d);
        const dayEnd = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        dayEnd.setHours(23, 59, 59, 999);

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
};

module.exports = {
    getAll,
    getRevenueReport,
    getAllRevenueReport,
    getDailyTicketRevenueByMovie,
    getDailyProductSalesByProduct
};