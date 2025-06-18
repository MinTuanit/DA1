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
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            error: { message: "Lỗi Server: " + error.message }
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: { message: "Email và mật khẩu là bắt buộc!" }
            });
        }

        const user = await User.findOne({ email: email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                error: { message: "Email hoặc mật khẩu không đúng!" }
            });
        }

        const accessToken = tokenservice.generateAccessToken(user);
        const refreshToken = tokenservice.generateRefreshToken(user);

        return res.status(200).json({ accessToken, refreshToken, user_id: user._id });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            error: { message: "Lỗi Server: " + error.message }
        });
    }
};

const blacklist = new Set();

const logout = (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                error: { message: "Thiếu refresh token!" }
            });
        }

        if (blacklist.has(refreshToken)) {
            return res.status(400).json({
                error: { message: "Token đã bị vô hiệu hóa!" }
            });
        }

        blacklist.add(refreshToken);
        return res.status(200).json({ message: "Đăng xuất thành công!" });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            error: { message: "Lỗi Server: " + error.message }
        });
    }
};

const refreshtoken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: { message: "Không có refresh token!" }
            });
        }

        const newAccessToken = tokenservice.refreshAccessToken(refreshToken);
        if (!newAccessToken) {
            return res.status(403).json({
                error: { message: "Refresh token không hợp lệ hoặc đã hết hạn!" }
            });
        }

        return res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            error: { message: "Lỗi Server: " + error.message }
        });
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
        if (!user) {
            return res.status(404).json({
                error: { message: "Không tìm thấy người dùng" }
            });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expireTime = Date.now() + 15 * 60 * 1000;

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expireTime;
        await user.save();

        const resetLink = `http://localhost:5173/user/reset-password?token=${token}`;

        await transporter.sendMail({
            from: `"Rạp Chiếu Phim" <${process.env.MAIL_USERNAME}>`,
            to: email,
            subject: "Yêu cầu đặt lại mật khẩu",
            html: `<p>Click vào link sau để đặt lại mật khẩu:</p><a href="${resetLink}">${resetLink}</a>`,
        });

        return res.status(200).json({ message: "Đã gửi email đặt lại mật khẩu" });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            error: { message: "Lỗi Server: " + error.message }
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                error: { message: "Token không hợp lệ hoặc đã hết hạn" }
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
        console.error("Lỗi server:", error);
        return res.status(500).json({
            error: { message: "Lỗi Server: " + error.message }
        });
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