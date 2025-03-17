const router = require("express").Router();
const authcontroller = require("../controllers/authcontroller")

router.post("/login", authcontroller.login);
router.post("/logout", authcontroller.logout);
router.post("/register", authcontroller.register);
router.post("/refreshtoken", authcontroller.refreshtoken);

module.exports = router;