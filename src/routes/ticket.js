const router = require("express").Router();
const ticketcontroller = require("../controllers/ticketcontroller")

router.get("/", ticketcontroller.getAllTickets);
router.get("/user/:userid", ticketcontroller.getTicketByUserId);
router.get("/:id", ticketcontroller.getTicketById);
router.post("/", ticketcontroller.createTicket);
router.patch("/:id", ticketcontroller.updateTicketById);
router.delete("/order/:orderid", ticketcontroller.deleteTicketByOrderId);
router.delete("/showtime/:showtimeid", ticketcontroller.deleteTicketByShowTimeId);
router.delete("/:id", ticketcontroller.deleteTicketById);

module.exports = router;