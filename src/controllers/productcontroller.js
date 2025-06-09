const Product = require("../models/product");
const Setting = require("../models/constraint");

const createProduct = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(500).send("Không tìm thấy cài đặt hệ thống.");
    }

    // ràng buộc giá sp
    const { min_product_price, max_product_price } = setting;
    const price = req.body.price;
    if (price < min_product_price || price > max_product_price) {
      return res.status(400).send(`Giá sản phẩm phải nằm trong khoảng ${min_product_price} đến ${max_product_price} VND`);
    }

    const product = await Product.create(req.body);
    return res.status(201).send(product);
  } catch (error) {
    console.log("Lỗi server! ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(201).send(products);
  } catch (error) {
    console.log("Lỗi server! ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log("Sản phẩm không tồn tại!");
      return res.status(404).send("Sản phẩm không tồn tại");
    }
    return res.status(201).send(product);
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log("Sản phẩm không tồn tại!");
      return res.status(404).send("Sản phẩm không tồn tại");
    }
    else return res.status(204).send("Xóa sản phẩm thành công");
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

const updateProductById = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(500).send("Không tìm thấy cài đặt hệ thống.");
    }

    // ràng buộc giá sp
    const { min_product_price, max_product_price } = setting;
    const price = req.body.price;
    if (price < min_product_price || price > max_product_price) {
      return res.status(400).send(`Giá sản phẩm phải nằm trong khoảng ${min_product_price} đến ${max_product_price} VND`);
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      console.log("Sản phẩm không tồn tại!");
      return res.status(404).send("Sản phẩm không tồn tại");
    }
    return res.status(200).send(product);
  } catch (error) {
    console.log("Lỗi server: ", error);
    return res.status(500).send("Lỗi Server");
  }
};

module.exports = {
  createProduct,
  updateProductById,
  getAllProducts,
  deleteProductById,
  getProductById
};