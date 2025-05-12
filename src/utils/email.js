const nodemailer = require('nodemailer');
const dotenv = require("dotenv");

dotenv.config();

const sendVerificationEmail = async (toEmail, code) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `"Rạp Chiếu Phim" <${process.env.MAIL_USERNAME}>`,
        to: toEmail,
        subject: 'Mã xác thực đơn hàng',
        text: `Cảm ơn bạn đã đặt ghế. Mã hóa đơn của bạn là: ${code}`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;