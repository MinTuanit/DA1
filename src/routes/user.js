const router = require("express").Router();
const usercontroller = require("../controllers/usercontroller")

router.get("/email", usercontroller.getUserByEmail);
router.get("/", usercontroller.getAllUsers);
router.get("/:id", usercontroller.getUserById);
router.post("/", usercontroller.createUser);
router.patch("/:id", usercontroller.updateUserById);
router.delete("/:id", usercontroller.deleteUserById);

module.exports = router;