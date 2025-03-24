const router = require("express").Router();
const roomcontroller = require("../controllers/roomcontroller")

router.get("/", roomcontroller.getAllRooms);
router.get("/:id", roomcontroller.getRoomById);
router.post("/", roomcontroller.createRoom);
router.patch("/:id", roomcontroller.updateRoomById);
router.delete("/:id", roomcontroller.deleteRoomById);

module.exports = router;