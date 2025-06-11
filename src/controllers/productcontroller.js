const Product = require("../models/product");
const Setting = require("../models/constraint");

const createProduct = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(500).json({ error: { message: "Không tìm thấy cài đặt hệ thống." } });
    }

    const { min_product_price, max_product_price } = setting;
    const price = req.body.price;
    if (price < min_product_price || price > max_product_price) {
      return res.status(400).json({
        error: { message: `Giá sản phẩm phải nằm trong khoảng ${min_product_price} đến ${max_product_price} VND` }
      });
    }

    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi server" } });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi server" } });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: { message: "Sản phẩm không tồn tại" } });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi server" } });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: { message: "Sản phẩm không tồn tại" } });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi server" } });
  }
};

const updateProductById = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(500).json({ error: { message: "Không tìm thấy cài đặt hệ thống." } });
    }

    const { min_product_price, max_product_price } = setting;
    const price = req.body.price;
    if (price < min_product_price || price > max_product_price) {
      return res.status(400).json({
        error: { message: `Giá sản phẩm phải nằm trong khoảng ${min_product_price} đến ${max_product_price} VND` }
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: { message: "Sản phẩm không tồn tại" } });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ error: { message: "Lỗi server" } });
  }
};

module.exports = {
  createProduct,
  updateProductById,
  getAllProducts,
  deleteProductById,
  getProductById
};