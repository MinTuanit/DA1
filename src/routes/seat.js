const router = require("express").Router();
const seatcontroller = require("../controllers/seatcontroller")

router.get("/", seatcontroller.getAllSeats);
router.get("/room/:roomid", seatcontroller.getSeatByRoomId);
router.get("/:id", seatcontroller.getSeatById);
router.post("/", seatcontroller.createSeat);
router.patch("/:id", seatcontroller.updateSeatById);
router.delete("/room/:roomid", seatcontroller.deleteSeatByRoomId);
router.delete("/:id", seatcontroller.deleteSeatById);

module.exports = router;