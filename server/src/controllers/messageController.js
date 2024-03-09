import asyncHandler from "express-async-handler";
import Message from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js";
import User from "../models/UserModel.js";

export const sendMessage = asyncHandler(async (req, res) => {
    // consume messages from kafka and then store in db
	const { content, chatId } = req.body;

	if (!content || !chatId) {
		console.log("Invalid data");
		return res.status(400);
	}
	const newMessage = {
		sender: req.user.id,
		content,
		chat: chatId,
	};

	try {
		let message = await Message.create(newMessage);
		message = await message.populate("sender", "name pic");
		message = await message.populate("chat");
		message = await User.populate(message, {
			path: "chat.users",
			select: "name pic email",
		});
		await Chat.findByIdAndUpdate(chatId, {
			latestMessage: message,
		});
		res.json(message);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

export const allMessages = asyncHandler(async (req, res) => {
	try {
		const messages = await Message.find({ chat: req.params.chatId })
			.populate("sender", "name pic email")
			.populate("chat");

		res.json(messages);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});
