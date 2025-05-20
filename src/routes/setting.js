const router = require("express").Router();
const settingcontroller = require("../controllers/settingcontroller");
const auth = require("../middlewares/auth");

router.get("/", settingcontroller.getSetting);
router.post("/", auth("manageCinema"), settingcontroller.createSetting);
router.patch("/", auth("manageCinema"), settingcontroller.updateSetting);

module.exports = router;