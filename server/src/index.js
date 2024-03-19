import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import SocketService from "./services/sockets.js";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import { startMessageConsumer } from "./services/kafka.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("API is running!");
});

app.use("/api/user", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/messages", messageRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen("5000", () => {
	console.log("Server is running on port 5000");
});
startMessageConsumer();
const socketService = new SocketService();
socketService.io.attach(server, {
	pingTimeout: 60000,
	cors: { origin: "*" },
});
socketService.initListeners();
