import { ViewIcon } from "@chakra-ui/icons";
import {
	useDisclosure,
	Button,
	Modal,
	ModalOverlay,
	ModalHeader,
	ModalCloseButton,
	ModalFooter,
	ModalContent,
	ModalBody,
	IconButton,
	useToast,
	Box,
	FormControl,
	Input,
	Spinner,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { StateContext } from "../../context/StateContext";
import { useContext } from "react";
import UserBadgeItem from "./UserBadgeItem";
import UserListItem from "./UserListItem";
import serverUrl from "../../utils/baseUrl";

const UpdateGroupChatModal = ({ fetchMessages }) => {
	const [groupChatName, setGroupChatName] = useState("");
	const [search, setSearch] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [renameLoading, setRenameLoading] = useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const {
		state: { selectedChat, userInfo, refreshChat },
		dispatch,
	} = useContext(StateContext);

	const handleRemove = async (user) => {
		if (
			selectedChat.groupAdmin._id !== userInfo._id &&
			userInfo._id !== user._id
		) {
			toast({
				title: "only admins can add users",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}
		setLoading(true);
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${userInfo.token}`,
				},
			};
			const { data } = await axios.put(
				`${serverUrl}/api/chats/groupremove`,
				{
					chatId: selectedChat._id,
					userId: user._id,
				},
				config
			);
			if (userInfo._id === user._id) {
				dispatch({
					type: "SELECT_CHAT",
					selectedChat: undefined,
				});
			} else {
				dispatch({
					type: "SELECT_CHAT",
					selectedChat: data,
				});
			}
			dispatch({
				type: "REFRESH_CHAT",
				refreshChat: !refreshChat,
			});
			fetchMessages();
		} catch (error) {
			toast({
				title: "Error Occurred",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
		setLoading(false);
	};
	const handleRename = async () => {
		if (!groupChatName) return;
		try {
			setRenameLoading(true);
			const config = {
				headers: {
					Authorization: `Bearer ${userInfo.token}`,
				},
			};
			const { data } = await axios.put(
				`${serverUrl}/api/chats/rename`,
				{
					chatId: selectedChat._id,
					chatName: groupChatName,
				},
				config
			);
			dispatch({
				type: "REFRESH_CHAT",
				refreshChat: !refreshChat,
			});
			dispatch({
				type: "SELECT_CHAT",
				selectedChat: data,
			});
			setRenameLoading(false);
		} catch (error) {
			toast({
				title: "Error Occurred",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setRenameLoading(false);
		}
		setGroupChatName("");
	};

	const handleSearch = async (query) => {
		setSearch(query);
		if (!query) {
			return;
		}
		try {
			setLoading(true);
			const config = {
				headers: {
					Authorization: "Bearer " + userInfo.token,
				},
			};
			const { data } = await axios.get(
				`${serverUrl}/api/user?search=${query}`,
				config
			);
			setLoading(false);
			setSearchResults(data.users);
		} catch (err) {
			toast({
				title: "Error occurred",
				description: "Failed to load search results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	const handleAddUser = async (user) => {
		if (selectedChat.users.find((u) => u._id === user._id)) {
			toast({
				title: "User is already in the group",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}
		if (selectedChat.groupAdmin._id !== userInfo._id) {
			toast({
				title: "only admins can add users",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}
		setLoading(true);
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${userInfo.token}`,
				},
			};
			const { data } = await axios.put(
				`${serverUrl}/api/chats/groupadd`,
				{
					chatId: selectedChat._id,
					userId: user._id,
				},
				config
			);
			dispatch({
				type: "REFRESH_CHAT",
				refreshChat: !refreshChat,
			});
			dispatch({
				type: "SELECT_CHAT",
				selectedChat: data,
			});
		} catch (error) {
			toast({
				title: "Error Occurred",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
		setLoading(false);
		setSearch("");
		setSearchResults([]);
	};

	return (
		<>
			<IconButton
				display={{ base: "flex" }}
				icon={<ViewIcon />}
				onClick={onOpen}
			/>

			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize="35px"
						fontFamily="Work sans"
						display="flex"
						justifyContent="center"
					>
						{selectedChat.chatName}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Box w="100%" display="flex" flexWrap="wrap" pb={3}>
							{selectedChat.users.map((user) => (
								<UserBadgeItem
									key={user._id}
									user={user}
									handleFunction={() => handleRemove(user)}
								/>
							))}
						</Box>
						<FormControl display="flex">
							<Input
								placeholder="Chat Name"
								mb={3}
								value={groupChatName}
								onChange={(e) => setGroupChatName(e.target.value)}
							/>
							<Button
								variant="solid"
								colorScheme="teal"
								ml={1}
								isLoading={renameLoading}
								onClick={handleRename}
							>
								Update
							</Button>
						</FormControl>
						<FormControl>
							<Input
								placeholder="Add Users"
								mb={1}
								value={search}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						{loading ? (
							<Spinner size="lg" />
						) : (
							searchResults?.map((user) => (
								<UserListItem
									key={user._id}
									user={user}
									handleFunction={() => handleAddUser(user)}
								/>
							))
						)}
					</ModalBody>

					<ModalFooter>
						<Button onClick={() => handleRemove(userInfo)} colorScheme="red">
							Leave Group
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
export default UpdateGroupChatModal;
