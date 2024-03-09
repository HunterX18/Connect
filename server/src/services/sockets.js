import { Server } from "socket.io";
import Redis from "ioredis";
import { producerMessage } from "./kafka.js";

const pub = new Redis({
	host: process.env.REDIS_HOST,
	port: 22261,
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
});
const sub = new Redis({
	host: process.env.REDIS_HOST,
	port: 22261,
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
});

class SocketService {
	constructor() {
		console.log("Init socker server...");
		this._io = new Server();
		sub.subscribe("MESSAGES");
		this.onlineUsers = {};
	}

	initListeners() {
		const io = this.io;
		io.on("connect", (socket) => {
			console.log("connected to socket");
			this.onlineUsers[socket.id] = socket;

			socket.on("setup", async (userData) => {
				await pub.publish(
					"MESSAGES",
					JSON.stringify({ event: "setup", socketId: socket.id, userData })
				);
				// socket.join(userData._id);
				// socket.emit("connected");
			});

			socket.on("join_chat", async (room) => {
				await pub.publish(
					"MESSAGES",
					JSON.stringify({ event: "join_chat", socketId: socket.id, room })
				);
				// socket.join(room);
				// console.log("User joined room: ", room);
			});

			socket.on("typing", async (room) => {
				await pub.publish(
					"MESSAGES",
					JSON.stringify({ event: "typing", socketId: socket.id, room: room })
				);
				// socket.in(room).emit("typing");
			});
			socket.on("stop_typing", async (room) => {
				await pub.publish(
					"MESSAGES",
					JSON.stringify({
						event: "stop_typing",
						socketId: socket.id,
						room: room,
					})
				);
				// socket.in(room).emit("stop_typing");
			});

			socket.on("new_message", async (messageInfo) => {
				await pub.publish(
					"MESSAGES",
					JSON.stringify({
						event: "new_message",
						socketId: socket.id,
						messageInfo: messageInfo,
					})
				);
				// const chat = message.chat;
				// if (!chat.users) {
				// 	console.log("chat.users not defined");
				// }
				// chat.users.forEach((user) => {
				// 	if (user._id === message.sender._id) return;
				// 	socket.in(user._id).emit("message_received", message);
				// });
			});

			socket.off("setup", (userData) => {
				console.log("USER DISCONNECTED");
				socket.leave(userData._id);
			});
		});

		sub.on("message", async (channel, data) => {
			if (channel === "MESSAGES") {
				data = JSON.parse(data);
				const { event, socketId } = data;
				const socket = this.onlineUsers[socketId];
				// console.log(event);
				if (event === "setup") {
					const { userData } = data;
					socket.join(userData._id);
					socket.emit("connected");
				} else if (event === "new_message") {
					const { content, sender, receivers, chatId } = data.messageInfo;
					// console.log("event: new_message", content);
					try {
						await producerMessage(JSON.stringify({ content, sender, chatId }));
						receivers.forEach((user) => {
							socket
								.in(user._id)
								.emit("message_received", { content, sender, chatId });
						});
					} catch (err) {
						console.log("socket level", err);
					}

					// const chat = message.chat;
					// if (!chat.users) {
					// 	console.log("chat.users not defined");
					// }
					// chat.users.forEach((user) => {
					// 	if (user._id === message.sender._id) return;
					// 	socket.in(user._id).emit("message_received", message);
					// });
				} else if (event === "join_chat") {
					const { socketId, room } = data;
					const socket = this.onlineUsers[socketId];
					socket.join(room);
					// console.log("User joined room: ", room);
				} else if (event === "typing") {
					const { room } = data;
					socket.in(room).emit("typing");
				} else if (event === "stop_typing") {
					const { room } = data;
					socket.in(room).emit("stop_typing");
				}
			}
		});
	}

	get io() {
		return this._io;
	}
}

export default SocketService;
