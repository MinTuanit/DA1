const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Token = require("../models/token");
const tokenservice = require("../services/token");
const usercontroller = require("../controllers/usercontroller");

const register = async (req, res) => {
    try {
        const user = await usercontroller.createUser(req, res);
        const tokens = await tokenservice.generateAuthTokens(user);
        return res.status(201).json({
            id: user._id,
            email: user.email,
            name: user.name,
            tokens
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!email || !password) {
            return res.status(400).json({ message: "Email và mật khẩu là bắt buộc!" });
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
        }

        const accessToken = tokenservice.generateAccessToken(user);
        const refreshToken = tokenservice.generateRefreshToken(user);

        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error("Lỗi server:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

const blacklist = new Set(); // Tạm lưu danh sách token bị vô hiệu hóa

const logout = (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Thiếu refresh token!" });
        }

        // Kiểm tra nếu token đã bị vô hiệu hóa trước đó
        if (blacklist.has(refreshToken)) {
            return res.status(400).json({ message: "Token đã bị vô hiệu hóa!" });
        }

        // Thêm token vào blacklist
        blacklist.add(refreshToken);
        return res.status(200).json({ message: "Đăng xuất thành công!" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
};

const refreshtoken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Không có refresh token!" });
    }

    const newAccessToken = refreshAccessToken(refreshToken);
    if (!newAccessToken) {
        return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn!" });
    }
    res.json({ accessToken: newAccessToken });
};

module.exports = {
    login,
    logout,
    refreshtoken,
    register
};
