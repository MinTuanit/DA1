const Cinema = require("../models/cinema");


const createCinema = async (req, res) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).send(cinema);
  } catch (error) {
    console.log("Lỗi server! ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find();
    res.status(201).send(cinemas);
  } catch (error) {
    console.log("Lỗi server! ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    res.status(201).send(cinema);
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

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
    res.status(200).send(cinema);
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
  deleteCinemaById
};