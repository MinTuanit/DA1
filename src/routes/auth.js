const router = require("express").Router();
const authcontroller = require("../controllers/authcontroller");
const validate = require("../middlewares/validate");
const authValidation = require("../validations/auth");

router.post("/forgot-password", authcontroller.forgotPassword);
router.post("/reset-password", authcontroller.resetPassword);
router.post("/login", validate(authValidation.login), authcontroller.login);
router.post("/logout", validate(authValidation.logout), authcontroller.logout);
router.post("/register", validate(authValidation.register), authcontroller.register);
router.post("/refreshtoken", validate(authValidation.refreshTokens), authcontroller.refreshtoken);

module.exports = router;