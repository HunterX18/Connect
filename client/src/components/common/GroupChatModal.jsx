import {
	useDisclosure,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	Button,
	useToast,
	FormControl,
	Input,
	Box,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import axios from "axios";
import { StateContext } from "../../context/StateContext";
import UserListItem from "./UserListItem";
import UserBadgeItem from "./UserBadgeItem";
import serverUrl from "../../utils/baseUrl";

const GroupChatModal = ({ children }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const [groupChatName, setGroupChatName] = useState("");
	const [selectedUsers, setSelecterdUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);

	const toast = useToast();

	const {
		state: { userInfo, chats },
		dispatch,
	} = useContext(StateContext);

	const handleSearch = async (e) => {
		setSearch(e);
		console.log(e);
		if (!e) {
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
				`${serverUrl}/api/user?search=${e}`,
				config
			);
			setLoading(false);
			console.log(data);
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

	const handleSubmit = async () => {
		if (!groupChatName || !selectedUsers) {
			toast({
				title: "Please fill all the fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}
		try {
			const config = {
				headers: {
					Authorization: "Bearer " + userInfo.token,
				},
			};
			const { data } = await axios.post(
				`${serverUrl}/api/chats/group`,
				{
					name: groupChatName,
					users: JSON.stringify(selectedUsers.map((u) => u._id)),
				},
				config
			);
			dispatch({
				type: "SET_CHATS",
				chats: [data, ...chats],
			});
			onClose();
			toast({
				title: "New group chat created",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		} catch (err) {
			toast({
				title: "Failed to create group",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	const handleGroup = (user) => {
		if (selectedUsers.includes(user)) {
			toast({
				title: "User already added",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
		} else {
			setSelecterdUsers([...selectedUsers, user]);
		}
	};

	const handleDelete = (user) => {
		setSelecterdUsers(selectedUsers.filter((u) => user._id !== u._id));
	};

	return (
		<>
			<span onClick={onOpen}>{children}</span>

			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontFamily="Work sans"
						display="flex"
						justifyContent="center"
					>
						Create Group Chat
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody display="flex" flexDir="column" alignItems="center">
						<FormControl>
							<Input
								placeholder="Chat Name"
								mb={3}
								onChange={(e) => setGroupChatName(e.target.value)}
							/>
						</FormControl>
						<FormControl>
							<Input
								placeholder="Add Users"
								mb={1}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						<Box display="flex" justifyContent="left" w="100%">
							{selectedUsers.map((user) => (
								<UserBadgeItem
									key={user._id}
									user={user}
									handleFunction={() => handleDelete(user)}
								/>
							))}
						</Box>
						{loading ? (
							<div>Loading...</div>
						) : (
							searchResults
								?.slice(0, 4)
								.map((user) => (
									<UserListItem
										key={user._id}
										user={user}
										handleFunction={() => handleGroup(user)}
									/>
								))
						)}
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" onClick={handleSubmit}>
							Create Chat
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
export default GroupChatModal;
