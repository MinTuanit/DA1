const Cinema = require("../models/cinema");
const Employee = require("../models/employee");
const Room = require("../models/room");

const createCinema = async (req, res) => {
  try {
    const cinema = await Cinema.create(req.body);
    return res.status(201).send(cinema);
  } catch (error) {
    console.log("Lỗi server! ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find();
    return res.status(201).send(cinemas);
  } catch (error) {
    console.log("Lỗi server! ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    return res.status(201).send(cinema);
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getEmployeeAndRoomById = async (req, res) => {
  try {
    const cinema_id = req.params.cinemaid;

    const [employeeCount, roomCount] = await Promise.all([
      Employee.countDocuments({ cinema_id }),
      Room.countDocuments({ cinema_id })
    ]);

    return res.json({
      cinema_id,
      employeeCount,
      roomCount
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin cinema:", error);
    return res.status(500).json({ message: "Lỗi server!" });
  }
}

const deleteCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      console.log("Rạp chiếu phim không tồn tại!");
      return res.status(404).send("Rạp chiếu phim không tồn tại");
    }
    else return res.status(204).send("Xóa rạp chiếu phim thành công");
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const updateCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!cinema) {
      console.log("Rạp chiếu phim không tồn tại!");
      return res.status(404).send("Rạp chiếu phim không tồn tại");
    }
    return res.status(200).send(cinema);
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
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