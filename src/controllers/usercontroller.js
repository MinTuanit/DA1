const User = require("../models/user");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  try {
    if (await User.isEmailTaken(req.body.email)) {
      return res.status(401).send("Email đã tồn tại vui lòng chọn email khác!");
    }
    if (await User.isPhoneTaken(phone)) {
      return res.status(400).send("Số điện thoại đã tồn tại");
    }
    if (await User.isCccdTaken(cccd)) {
      return res.status(400).send("CCCD đã tồn tại");
    }
    if (!password.match(/\d/) || !password.match(/[a-zA-Z]/)) {
      return res.status(401).send("Mật khẩu phải chứa ít nhất 8 ký tự và chứa 1 số và 1 chữ cái.");
    }
    const user = await User.create(req.body);
    return user;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(201).send(users);
  } catch (error) {
    console.log("Lỗi server! ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log("Tài khoản không tồn tại!");
      return res.status(404).send("Không tìm thấy tài khoản có id:" + req.params.id);
    }
    return res.status(201).send(user);
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Thiếu email!" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi server: ", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

const getUserByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['customer', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).send("Vai trò không hợp lệ: " + role);
    }
    const users = await User.find({ role });
    if (users.length === 0) {
      console.log("Không tìm thấy người dùng với vai trò:", role);
      return res.status(404).send("Không tìm thấy người dùng với vai trò: " + role);
    }
    return res.status(200).send(users);
  } catch (error) {
    console.log("Lỗi server:", error);
    return res.status(500).send("Lỗi Server");
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log("Tài khoản không tồn tại!");
      return res.status(404).send("Không tìm thấy tài khoản có id:" + req.params.id);
    }
    else return res.status(204).send("Xóa tài khoản thành công");
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const updateUserById = async (req, res) => {
  try {
    req.body.password = await bcrypt.hash(req.body.password, 8);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
      console.log("Tài khoản không tồn tại!");
      return res.status(404).send("Không tìm thấy tài khoản có id:" + req.params.id);
    }
    return res.status(200).send(user);
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

module.exports = {
  createUser,
  updateUserById,
  getAllUsers,
  deleteUserById,
  getUserById,
  getUserByEmail,
  getUserByRole
};