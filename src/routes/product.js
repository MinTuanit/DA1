const router = require("express").Router();
const productcontroller = require("../controllers/productcontroller")

router.get("/", productcontroller.getAllProducts);
router.get("/:id", productcontroller.getProductById);
router.post("/", productcontroller.createProduct);
router.put("/:id", productcontroller.updateProductById);
router.delete("/:id", productcontroller.deleteProductById);

module.exports = router;