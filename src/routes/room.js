const router = require("express").Router();
const roomcontroller = require("../controllers/roomcontroller");
const auth = require("../middlewares/auth");

router.get("/", auth("getRoom"), roomcontroller.getAllRooms);
router.get("/:id", auth("getRoom"), roomcontroller.getRoomById);
router.post("/", auth("manageRoom"), roomcontroller.createRoom);
router.patch("/:id", auth("manageRoom"), roomcontroller.updateRoomById);
router.delete("/:id", auth("manageRoom"), roomcontroller.deleteRoomById);

module.exports = router;