import express from "express";
import { saveChat, getChatHistory, deleteChat } from "../controllers/chatController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();

// Protected routes
router.post("/save", authUser, saveChat);
router.post("/history", authUser, getChatHistory);
router.post("/delete", authUser, deleteChat);

export default router;
// import chatController from "../controllers/chatController.js";



// const router = express.Router();
// // const chatController = require('../controllers/chatController.js');
// // const authUser = require('../middleware/authUser.js');

// // Conversation routes
// router.post('/conversations', authUser, chatController.createConversation);
// router.get('/conversations', authUser, chatController.getConversations);
// router.delete('/conversations/:id', authUser, chatController.deleteConversation);

// // Message routes
// router.post('/messages', authUser, chatController.saveMessage);
// router.get('/messages/:conversationId', authUser, chatController.getMessages);

// // Grok API route
// router.post('/grok', authUser, chatController.getGrokResponse);

// export default router;