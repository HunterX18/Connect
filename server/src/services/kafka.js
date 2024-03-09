import { Kafka, Partitioners } from "kafkajs";
import fs from "fs";
import path from "path";
import Message from "../models/MessageModel.js";
import User from "../models/UserModel.js";
import Chat from "../models/ChatModel.js";

const kafka = new Kafka({
	brokers: [process.env.KAFKA_BROKER],
	ssl: {
		ca: [fs.readFileSync(path.resolve("./src/services/ca.pem"), "utf-8")],
	},
	sasl: {
		username: process.env.KAFKA_USERNAME,
		password: process.env.KAFKA_PASSWORD,
		mechanism: "plain",
	},
});

let producer = null;

export async function createProducer() {
	if (producer) return producer;
	const _producer = kafka.producer({
		createPartitioner: Partitioners.LegacyPartitioner,
	});
	await _producer.connect();
	producer = _producer;
	return producer;
}

export async function producerMessage(message) {
	const producer = await createProducer();
	producer.send({
		messages: [{ key: `message-${Date.now()}`, value: message }],
		topic: "MESSAGES",
	});
	return true;
}

export async function startMessageConsumer() {
	const consumer = kafka.consumer({ groupId: "default" });
	await consumer.connect();
	await consumer.subscribe({ topics: ["MESSAGES"], fromBeginning: true });
	await consumer.run({
		autoCommit: true,
		eachMessage: async ({ message, pause }) => {
			message = JSON.parse(message.value);
			// console.log("Message received in Kafka", message);
			const newMessage = {
				sender: message.sender._id,
				content: message.content,
				chat: message.chatId,
			};

			try {
				let msg = await Message.create(newMessage);
				msg = await msg.populate("sender", "name pic");
				msg = await msg.populate("chat");
				msg = await User.populate(msg, {
					path: "chat.users",
					select: "name pic email",
				});
				await Chat.findByIdAndUpdate(message.chatId, {
					latestMessage: msg,
				});
				console.log("successfully saved to db from kafka");
			} catch (error) {
				throw new Error(error);
			}
		},
	});
}

export default kafka;
