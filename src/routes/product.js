const router = require("express").Router();
const productcontroller = require("../controllers/productcontroller");
const auth = require("../middlewares/auth");

router.get("/", productcontroller.getAllProducts);
router.get("/:id", productcontroller.getProductById);
router.post("/", auth("manageProduct"), productcontroller.createProduct);
router.put("/:id", auth("manageProduct"), productcontroller.updateProductById);
router.delete("/:id", auth("manageProduct"), productcontroller.deleteProductById);

module.exports = router;