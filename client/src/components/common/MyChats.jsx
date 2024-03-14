import React, { useContext, useState, useEffect } from "react";
import { StateContext } from "../../context/StateContext";
import { Text, useToast, Box, Button, Stack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";
import ChatLoading from "./ChatLoading.jsx";
import GroupChatModal from "./GroupChatModal.jsx";
import { getSender } from "../../utils/getSender.js";
import serverUrl from "../../utils/baseUrl.js";

const MyChats = () => {
	const {
		state: { selectedChat, userInfo, chats, refreshChat },
		dispatch,
	} = useContext(StateContext);

	const [loggedUser, setLoggedUser] = useState();
	const [loading, setLoading] = useState(false);
	const toast = useToast();

	const fetchChats = async () => {
		setLoading(true);
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${userInfo.token}`,
				},
			};
			const { data } = await axios.get(`${serverUrl}/api/chats`, config);
			// console.log(data);
			dispatch({
				type: "SET_CHATS",
				chats: data,
			});
		} catch (err) {
			toast({
				title: "Error fetching chats",
				description: "Failed to load chats",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
			setLoading(false);
	};

	useEffect(() => {
		setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
		fetchChats();
	}, [refreshChat]);

	return (
		<Box
			display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
			flexDir="column"
			alignItems="center"
			p={3}
			bg="white"
			w={{ base: "100%", md: "30%" }}
			borderRadius="lg"
			borderWidth="1px"
		>
			<Box
				pb={3}
				px={3}
				fontSize={{ base: "25px", md: "30px" }}
				fontFamily="Work sans"
				display="flex"
				w="100%"
				justifyContent="space-between"
				alignItems="center"
			>
				My Chats
				<GroupChatModal>
					<Button
						display="flex"
						fontSize={{ base: "17px", md: "10px", lg: "17px" }}
						rightIcon={<AddIcon />}
					>
						New Group Chat
					</Button>
				</GroupChatModal>
			</Box>
			<Box
				display="flex"
				flexDirection="column"
				p={3}
				bg="#F8F8F8"
				w="100%"
				h="100%"
				borderRadius="lg"
				overflowY="hidden"
			>
				{!loading ? (
					<Stack overflowY="scroll">
						{chats.map((chat) => (
							<Box
								onClick={() =>
									dispatch({ type: "SELECT_CHAT", selectedChat: chat })
								}
								cursor="pointer"
								bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
								color={selectedChat === chat ? "white" : "black"}
								px={3}
								py={2}
								borderRadius="lg"
								key={chat._id}
							>
								<Text>
									{!chat.isGroupChat
										? getSender(loggedUser, chat.users)
										: chat.chatName}
								</Text>
							</Box>
						))}
					</Stack>
				) : (
					<ChatLoading />
				)}
			</Box>
		</Box>
	);
};

export default MyChats;
