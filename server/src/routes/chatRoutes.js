import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
	accessChat,
	getChats,
	createGroupChat,
	renameGroup,
	addToGroup,
	removeFromGroup,
} from "../controllers/chatControllers.js";

const chatRouter = Router();

chatRouter.post("/", protect, accessChat);

chatRouter.get("/", protect, getChats);

chatRouter.post("/group", protect, createGroupChat);
chatRouter.put("/rename", protect, renameGroup);
chatRouter.put("/groupadd", protect, addToGroup);
chatRouter.put("/groupremove", protect, removeFromGroup);

export default chatRouter;
