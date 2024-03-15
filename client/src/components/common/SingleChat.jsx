import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { StateContext } from "../../context/StateContext";
import {
	Text,
	Box,
	IconButton,
	Spinner,
	FormControl,
	Input,
	useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSenderFull, getSender } from "../../utils/getSender";
import ProfileModal from "../common/ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import serverUrl from "../../utils/baseUrl";

var selectedChatCompare;

const SingleChat = () => {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [typing, setTyping] = useState(false);
	const [isTyping, setIsTyping] = useState(false);
	const toast = useToast();

	const {
		state: { userInfo, selectedChat, notifications, refreshChat },
		dispatch,
	} = useContext(StateContext);

	const socket = useRef();

	// console.log(selectedChat);

	useEffect(() => {
		fetchMessages();
		selectedChatCompare = selectedChat;
	}, [selectedChat]);

	useEffect(() => {
		socket.current = io(`${serverUrl}`);
		socket.current.emit("setup", userInfo);
		socket.current.on("connected", () => {
			dispatch({
				type: "SET_SOCKET",
				socket: socket.current,
			});
		});
		socket.current.on("typing", () => {
			console.log("typing");
			setIsTyping(true);
		});
		socket.current.on("stop_typing", () => {
			setIsTyping(false);
		});
		socket.current.on("message_received", (message) => {
			if (!selectedChatCompare || selectedChatCompare._id !== message.chatId) {
				if (!notifications.includes(message)) {
					dispatch({
						type: "SET_NOTIFICATIONS",
						notifications: [message, ...notifications],
					});
					dispatch({
						type: "REFRESH_CHAT",
						refreshChat: !refreshChat,
					});
				}
			} else {
				// console.log(messages.length);
				setMessages([...messages, message]);
			}
		});

		return () => {
			socket.current.disconnect();
			dispatch({
				type: "SET_SOCKET",
				socket: undefined,
			});
		};
	}, []);

	// useEffect(() => {
	// 	socket.current.on("message_received", (message) => {
	// 		if (
	// 			!selectedChatCompare ||
	// 			selectedChatCompare._id !== message.chat._id
	// 		) {
	// 			if (!notifications.includes(message)) {
	// 				dispatch({
	// 					type: "SET_NOTIFICATIONS",
	// 					notifications: [message, ...notifications],
	// 				});
	// 				dispatch({
	// 					type: "REFRESH_CHAT",
	// 					refreshChat: !refreshChat,
	// 				});
	// 			}
	// 		} else {
	// 			// console.log(messages.length);
	// 			setMessages([...messages, message]);
	// 		}
	// 	});
	// }, []);

	const fetchMessages = async () => {
		if (!selectedChat) {
			return;
		}
		setLoading(true);
		try {
			const config = {
				headers: {
					Authorization: "Bearer " + userInfo.token,
				},
			};
			const { data } = await axios.get(
				`${serverUrl}/api/messages/${selectedChat._id}`,
				config
			);
			// console.log(data);
			setMessages(data);
			socket.current.emit("join_chat", selectedChat._id);
		} catch (err) {
			toast({
				title: "Error occurred",
				description: "Failed to fetch messages",
				status: "error",
				duration: 5000,
				position: "bottom",
			});
		}
		setLoading(false);
	};

	const sendMessage = async (event) => {
		if (event.key === "Enter" && newMessage) {
			// console.log(newMessage);
			let sender;
			let receivers = [];
			for (let user of selectedChat.users) {
				if (user._id === userInfo._id) {
					sender = user;
				} else {
					receivers.push(user);
				}
			}
			// console.log(sender, receivers);
			socket.current.emit("stop_typing", selectedChat._id);
			try {
				// const config = {
				// 	headers: {
				// 		"Content-Type": "application/json",
				// 		Authorization: "Bearer " + userInfo.token,
				// 	},
				// };
				setNewMessage("");
				// const { data } = await axios.post(
				// 	"http://localhost:5000/api/messages",
				// 	{
				// 		content: newMessage,
				// 		chatId: selectedChat._id,
				// 	},
				// 	config
				// );
				// console.log(data);
				// data = { chat, content, sender };
				// setMessages([...messages, data]);
				setMessages([...messages, { content: newMessage, sender }]);
				socket.current.emit("new_message", {
					content: newMessage,
					chatId: selectedChat._id,
					sender,
					receivers,
				});
				// socket.current.emit("new_message", data);
			} catch (err) {
				toast({
					title: "Error occurred",
					description: "Failed to send message",
					status: "error",
					duration: 5000,
					position: "bottom",
				});
			}
		}
	};

	const typingHandler = (e) => {
		setNewMessage(e.target.value);
		if (socket.current === undefined) {
			return;
		}
		if (e.target.value !== "") {
			if (!typing) {
				setTyping(true);
				socket.current.emit("typing", selectedChat._id);
			}
		} else {
			socket.current.emit("stop_typing", selectedChat._id);
			setTyping(false);
		}
	};

	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: "28px", md: "30px" }}
						pb={3}
						px={2}
						w="100%"
						fontFamily="Work sans"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<IconButton
							display={{ base: "flex", md: "none" }}
							icon={<ArrowBackIcon />}
							onClick={() =>
								dispatch({
									type: "SELECT_CHAT",
									selectedChat: undefined,
								})
							}
						/>
						{!selectedChat.isGroupChat ? (
							<>
								{getSender(userInfo, selectedChat.users)}
								<ProfileModal
									userInfo={getSenderFull(userInfo, selectedChat.users)}
								/>
							</>
						) : (
							<>
								{selectedChat.chatName.toUpperCase()}
								<UpdateGroupChatModal fetchMessages={fetchMessages} />
							</>
						)}
					</Text>
					<Box
						display="flex"
						flexDir="column"
						justifyContent="flex-end"
						p={3}
						bg="#E8E8E8"
						w="100%"
						h="100%"
						borderRadius="lg"
						overflowY="hidden"
					>
						{loading ? (
							<Spinner
								size="xl"
								w={20}
								h={20}
								alignSelf="center"
								margin="auto"
							/>
						) : (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									overflowY: "scroll",
									scrollbarWidth: "none",
								}}
							>
								<ScrollableChat messages={messages} />
							</div>
						)}
					</Box>
					<FormControl onKeyDown={sendMessage} isRequired mt={3}>
						{isTyping ? <div>typing...</div> : <></>}
						<Input
							variant="filled"
							bg="#E0E0E0"
							placeholder="Enter a message..."
							onChange={(e) => typingHandler(e)}
							value={newMessage}
						/>
					</FormControl>
				</>
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					h="100%"
				>
					<Text>Click on a user to start chatting</Text>
				</Box>
			)}
		</>
	);
};

export default SingleChat;
