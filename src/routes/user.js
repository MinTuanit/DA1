const router = require("express").Router();
const usercontroller = require("../controllers/usercontroller");
const auth = require("../middlewares/auth");

router.get("/email", auth("getUser"), usercontroller.getUserByEmail);
router.get("/credit/:userid", auth("getUser"), usercontroller.getUserCreditPoints);
router.get("/role/:role"/*, auth("getUser")*/, usercontroller.getUserByRole);
router.get("/", auth("manageUser"), usercontroller.getAllUsers);
router.get("/:id", auth("getUser"), usercontroller.getUserById);
router.post("/", usercontroller.createUser);
router.patch("/:id", auth("getUser"), usercontroller.updateUserById);
router.delete("/:id", auth("getUser"), usercontroller.deleteUserById);

module.exports = router;