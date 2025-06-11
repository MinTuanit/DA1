const Cinema = require("../models/cinema");
const Employee = require("../models/employee");
const Room = require("../models/room");

const createCinema = async (req, res) => {
  try {
    const cinema = await Cinema.create(req.body);
    return res.status(201).json(cinema);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi Server" } });
  }
};

const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find();
    return res.status(200).json(cinemas);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi Server" } });
  }
};

const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ error: { message: "Không tìm thấy rạp chiếu phim." } });
    }
    return res.status(200).json(cinema);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi Server" } });
  }
};

const getEmployeeAndRoomById = async (req, res) => {
  try {
    const cinema_id = req.params.cinemaid;

    const [employeeCount, roomCount] = await Promise.all([
      Employee.countDocuments({ cinema_id }),
      Room.countDocuments({ cinema_id })
    ]);

    return res.status(200).json({
      cinema_id,
      employeeCount,
      roomCount
    });
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi server!" } });
  }
};

const deleteCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      return res.status(404).json({ error: { message: "Rạp chiếu phim không tồn tại" } });
    }
    return res.status(200).json({ message: "Xóa rạp chiếu phim thành công" });
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi Server" } });
  }
};

const updateCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cinema) {
      return res.status(404).json({ error: { message: "Rạp chiếu phim không tồn tại" } });
    }
    return res.status(200).json(cinema);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi Server" } });
  }
};

module.exports = {
  createCinema,
  updateCinemaById,
  getCinemaById,
  getAllCinemas,
  deleteCinemaById,
  getEmployeeAndRoomById
};