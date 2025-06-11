const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Lỗi máy chủ nội bộ";

    res.status(statusCode).json({
        error: {
            message
        }
    });
};

module.exports = errorHandler;