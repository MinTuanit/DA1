const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const tokenservice = require("../services/token");
const usercontroller = require("../controllers/usercontroller");
const dotenv = require("dotenv");

dotenv.config();

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

        return res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ message: "Lỗi server!" });
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

const refreshtoken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "Không có refresh token!" });
        }

        const newAccessToken = tokenservice.refreshAccessToken(refreshToken);
        if (!newAccessToken) {
            return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn!" });
        }
        return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({ message: "Lỗi server!" });
    }
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("Không tìm thấy người dùng");

        const token = crypto.randomBytes(32).toString("hex");
        const expireTime = Date.now() + 15 * 60 * 1000; // 15 phút

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expireTime;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password?token=${token}`; // link fe reset password

        await transporter.sendMail({
            from: `"Rạp Chiếu Phim" <${process.env.MAIL_USERNAME}>`,
            to: email,
            subject: "Yêu cầu đặt lại mật khẩu",
            html: `<p>Click vào link sau để đặt lại mật khẩu:</p><a href="${resetLink}">${resetLink}</a>`,
        });

        return res.send("Đã gửi email đặt lại mật khẩu");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).send("Token không hợp lệ hoặc đã hết hạn");

        user.password = await bcrypt.hash(newPassword, 8);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.send("Đặt lại mật khẩu thành công");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};

module.exports = {
    register,
    login,
    logout,
    refreshtoken,
    forgotPassword,
    resetPassword,
};  