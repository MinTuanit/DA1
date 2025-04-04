const router = require("express").Router();
const seatcontroller = require("../controllers/seatcontroller");
const auth = require("../middlewares/auth");

router.get("/", auth("getSeat"), seatcontroller.getAllSeats);
router.get("/room/:roomid", auth("getSeat"), seatcontroller.getSeatByRoomId);
router.get("/:id", auth("getSeat"), seatcontroller.getSeatById);
router.post("/", auth("manageSeat"), seatcontroller.createSeat);
router.patch("/:id", auth("manageSeat"), seatcontroller.updateSeatById);
router.delete("/room/:roomid", auth("manageSeat"), seatcontroller.deleteSeatByRoomId);
router.delete("/:id", auth("manageSeat"), seatcontroller.deleteSeatById);

module.exports = router;