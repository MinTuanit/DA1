const router = require("express").Router();
const roomcontroller = require("../controllers/roomcontroller");
const auth = require("../middlewares/auth");

router.get("/", auth("getRoom"), roomcontroller.getAllRooms);
router.get("/cinema/:cinemaid", auth("getRoom"), roomcontroller.getRoomByCinemaId);
router.get("/:id", auth("getRoom"), roomcontroller.getRoomById);
router.post("/seats", auth("manageRoom"), roomcontroller.createRoomWithSeats);
router.post("/", auth("manageRoom"), roomcontroller.createRoom);
router.patch("/:id", auth("manageRoom"), roomcontroller.updateRoomWithSeatsById);
router.delete("/:id", auth("manageRoom"), roomcontroller.deleteRoomById);

module.exports = router;