import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { sendMessage, allMessages } from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.post("/", protect, sendMessage);
messageRouter.get("/:chatId", protect, allMessages);

export default messageRouter;
