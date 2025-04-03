const router = require("express").Router();
const usercontroller = require("../controllers/usercontroller");
const auth = require("../middlewares/auth");

router.get("/email", auth("getUser"), usercontroller.getUserByEmail);
router.get("/", auth("manageUser"), usercontroller.getAllUsers);
router.get("/:id", auth("getUser"), usercontroller.getUserById);
router.post("/", auth("getUser"), usercontroller.createUser);
router.patch("/:id", auth("getUser"), usercontroller.updateUserById);
router.delete("/:id", auth("getUser"), usercontroller.deleteUserById);

module.exports = router;