const router = require("express").Router();
const chatbotController = require("../controllers/chatbotcontroller");

router.post("/", chatbotController.chatbot);

module.exports = router;