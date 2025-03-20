const Movie = require("../models/movie");


const createMovie = async (req, res) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).send(movie);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(201).send(movies);
    } catch (error) {
        console.log("Lỗi server! ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const getAMovies = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            console.log("Phim không tồn tại!");
            return res.status(404).send("Phim không tồn tại");
        }
        res.status(201).send(movie);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const deleteMovieById = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            console.log("Phim không tồn tại!");
            return res.status(404).send("Phim không tồn tại");
        }
        else return res.status(204).send("Xóa phim thành công");
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

const updateMovieById = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!movie) {
            console.log("Phim không tồn tại!");
            return res.status(404).send("Phim không tồn tại");
        }
        res.status(200).send(movie);
    } catch (error) {
        console.log("Lỗi server: ", error);
        return res.status(500).send("Lỗi Server");
    }
};

module.exports = {
    createMovie,
    updateMovieById,
    getAllMovies,
    deleteMovieById,
    getAMovies
};