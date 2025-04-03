const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const dayjs = require("dayjs");

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const TOKEN_EXPIRATION = "1h";
const ACCESS_EXPIRATION_MINUTES = 60;
const REFRESH_EXPIRATION_DAYS = 7;
const REFRESH_TOKEN_EXPIRATION = "7d";

const generateToken = (userId, expires, type, secret = SECRET_KEY) => {
    const payload = {
        sub: userId,
        iat: dayjs().unix(),
        exp: dayjs(expires).unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

const generateAccessToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Lấy token từ header

    if (!token) {
        return res.status(401).json({ message: "Không có token, từ chối truy cập!" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // Lưu thông tin user vào req
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = dayjs().add(ACCESS_EXPIRATION_MINUTES, "minutes");
    const accessToken = generateToken(user._id, accessTokenExpires.toDate(), "access", SECRET_KEY);

    const refreshTokenExpires = dayjs().add(REFRESH_EXPIRATION_DAYS, "days");
    const refreshToken = generateToken(user._id, refreshTokenExpires.toDate(), "refresh", REFRESH_SECRET);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        return generateAccessToken({ _id: decoded.id, email: decoded.email });
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    refreshAccessToken,
    generateAuthTokens
};