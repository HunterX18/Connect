import asyncHandler from "express-async-handler";
import Chat from "../models/ChatModel.js";
import User from "../models/UserModel.js";

export const accessChat = asyncHandler(async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		console.log("User id param not sent with request");
		return res.sendStatus(400);
	}
	let isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{
				users: { $elemMatch: { $eq: req.user.id } },
			},
			{
				users: { $elemMatch: { $eq: userId } },
			},
		],
	})
		.populate("users", "-password")
		.populate("latestMessage");

	isChat = await User.populate(isChat, {
		path: "latestMessage.sender",
		select: "name email pic",
	});
	if (isChat.length > 0) {
		res.send(isChat[0]);
	} else {
		let chatData = {
			chatName: "sender",
			isGroupChat: false,
			users: [req.user.id, userId],
		};

		try {
			const createdChat = await Chat.create(chatData);
			const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
				"users",
				"-password"
			);
			res.status(200).send(fullChat);
		} catch (err) {
			console.log(err);
		}
	}
});

export const getChats = asyncHandler(async (req, res) => {
	try {
		let result = await Chat.find({
			users: { $elemMatch: { $eq: req.user.id } },
		})
			.populate("users", "-password")
			.populate("groupAdmin", "-password")
			.populate("latestMessage")
			.sort("updatedAt");
		result = await User.populate(result, {
			path: "latestMessage.sender",
			select: "name pic email",
		});
		res.status(200).send(result);
	} catch (err) {
		res.status(400);
		throw new Error(err.message);
	}
});

export const createGroupChat = asyncHandler(async (req, res) => {
	if (!req.body.users || !req.body.name) {
		return res.status(400).send({ message: "Please fill all the fields" });
	}
	let users = JSON.parse(req.body.users);
	if (users.length < 2) {
		return res
			.status(400)
			.send("More than 2 users are required to form a group");
	}
	users.push(req.user.id);
	try {
		const groupChat = await Chat.create({
			chatName: req.body.name,
			users: users,
			isGroupChat: true,
			groupAdmin: req.user.id,
		});
		const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
			.populate("users", "-password")
			.populate("groupAdmin", "-password");
		res.status(200).json(fullGroupChat);
	} catch (err) {
		res.status(400);
		console.log(err.message);
		throw new Error(err.message);
	}
});

export const renameGroup = asyncHandler(async (req, res) => {
	const { chatId, chatName } = req.body;
	const updatedChat = await Chat.findByIdAndUpdate(
		chatId,
		{ chatName },
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!updatedChat) {
		res.status(404);
		throw new Error("Chat not found");
	}
	res.json(updatedChat);
});

export const addToGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;
	const added = await Chat.findByIdAndUpdate(
		chatId,
		{
			$push: { users: userId },
		},
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!added) {
		res.status(404);
		throw new Error("Chat not found");
	}
	res.json(added);
});

export const removeFromGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;
	const removed = await Chat.findByIdAndUpdate(
		chatId,
		{
			$pull: { users: userId },
		},
		{ new: true }
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");
	if (!removed) {
		res.status(404);
		throw new Error("Chat not found");
	}
	res.json(removed);
});
