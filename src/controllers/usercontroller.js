const User = require("../models/user");
const Order = require("../models/order");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  const { email, phone, cccd, password } = req.body;
  try {
    if (await User.isEmailTaken(email)) {
      return res.status(409).json({ error: { message: "Email đã tồn tại, vui lòng chọn email khác!" } });
    }
    if (await User.isPhoneTaken(phone)) {
      return res.status(409).json({ error: { message: "Số điện thoại đã tồn tại" } });
    }
    if (await User.isCccdTaken(cccd)) {
      return res.status(409).json({ error: { message: "CCCD đã tồn tại" } });
    }
    if (!password.match(/\d/) || !password.match(/[a-zA-Z]/) || password.length < 8) {
      return res.status(400).json({ error: { message: "Mật khẩu phải chứa ít nhất 8 ký tự và chứa 1 số và 1 chữ cái." } });
    }
    const user = await User.create(req.body);
    return res.status(201).json({ user });
  } catch (error) {
    console.error("Lỗi server!", error);
    return res.status(500).json({ error: { message: "Đã xảy ra lỗi khi tạo người dùng: " + error.message } });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi server!", error);
    return res.status(500).json({ error: { message: "Lỗi Server: " + error.message } });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: { message: "Không tìm thấy tài khoản có id: " + req.params.id } });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi server!", error);
    return res.status(500).json({ error: { message: "Lỗi Server: " + error.message } });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: { message: "Thiếu email!" } });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: { message: "Email không tồn tại!" } });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi server!", error);
    return res.status(500).json({ error: { message: "Lỗi Server: " + error.message } });
  }
};

const getUserByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ["customer", "employee"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: { message: "Vai trò không hợp lệ: " + role } });
    }

    const users = await User.find({ role });
    if (users.length === 0) {
      return res.status(404).json({ error: { message: "Không tìm thấy người dùng với vai trò: " + role } });
    }

    const usersWithCredit = await Promise.all(users.map(async user => {
      const orders = await Order.find({
        user_id: user._id,
        status: 'completed'
      });

      const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);

      return {
        ...user.toObject(),
        credit: totalSpent
      };
    }));

    return res.status(200).json(usersWithCredit);
  } catch (error) {
    console.error("Lỗi server!", error);
    return res.status(500).json({ error: { message: "Lỗi Server: " + error.message } });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: { message: "Không tìm thấy tài khoản có id: " + req.params.id } });
    }
    return res.status(200).json({ message: "Xóa tài khoản thành công" });
  } catch (error) {
    console.error("Lỗi server!", error);
    return res.status(500).json({ error: { message: "Lỗi Server: " + error.message } });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { email, phone, cccd, password } = req.body;
    const userId = req.params.id;

    // Kiểm tra trùng email
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== userId) {
        return res.status(409).json({ error: { message: "Email đã tồn tại, vui lòng chọn email khác!" } });
      }
    }

    // Kiểm tra trùng số điện thoại
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone && existingPhone._id.toString() !== userId) {
        return res.status(409).json({ error: { message: "Số điện thoại đã tồn tại" } });
      }
    }

    // Kiểm tra trùng CCCD
    if (cccd) {
      const existingCccd = await User.findOne({ cccd });
      if (existingCccd && existingCccd._id.toString() !== userId) {
        return res.status(409).json({ error: { message: "CCCD đã tồn tại" } });
      }
    }

    // Kiểm tra mật khẩu hợp lệ nếu có
    if (password) {
      if (password.length < 8 || !password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
        return res.status(400).json({ error: { message: "Mật khẩu phải chứa ít nhất 8 ký tự và chứa 1 số và 1 chữ cái." } });
      }
      req.body.password = await bcrypt.hash(password, 8);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: { message: "Không tìm thấy tài khoản có id: " + userId } });
    }

    return res.status(200).json({ user: updatedUser });

  } catch (error) {
    console.error("Lỗi server!", error);
    return res.status(500).json({ error: { message: "Lỗi Server: " + error.message } });
  }
};

const getUserCreditPoints = async (req, res) => {
  const { userid } = req.params;

  try {
    const orders = await Order.find({
      user_id: userid,
      status: 'completed'
    });

    const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);

    return res.status(200).json({
      credit_points: totalSpent
    });
  } catch (err) {
    return res.status(500).json({ error: { message: "Lỗi khi tính điểm tích lũy" } });
  }
};

module.exports = {
  createUser,
  updateUserById,
  getAllUsers,
  deleteUserById,
  getUserById,
  getUserByEmail,
  getUserByRole,
  getUserCreditPoints
};