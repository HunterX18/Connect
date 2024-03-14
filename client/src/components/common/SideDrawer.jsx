import {
	Box,
	Button,
	MenuButton,
	Text,
	Tooltip,
	Menu,
	MenuList,
	Avatar,
	MenuItem,
	MenuDivider,
	Drawer,
	useDisclosure,
	DrawerOverlay,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	Input,
	useToast,
	Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useContext, useState } from "react";
import { StateContext } from "../../context/StateContext";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import ChatLoading from "./ChatLoading";
import UserListItem from "./UserListItem";
import { getSender } from "../../utils/getSender";
import serverUrl from "../../utils/baseUrl";

const SideDrawer = () => {
	const [search, setSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingChat, setLoadingChat] = useState(false);

	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const {
		state: { chats, notifications },
		dispatch,
	} = useContext(StateContext);

	// console.log(notifications);

	const navigate = useNavigate();
	const {
		state: { userInfo },
	} = useContext(StateContext);

	const logoutHandler = () => {
		localStorage.removeItem("userInfo");
		navigate("/");
	};

	const handleSearch = async () => {
		if (!search) {
			toast({
				title: "Please enter something",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top-left",
			});
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
				`${serverUrl}/api/user?search=${search}`,
				config
			);

			if (!chats.find((c) => c._id === data._id)) {
				dispatch({
					type: "SET_CHATS",
					chats: [...chats, data],
				});
			}
			setLoading(false);
			setSearchResult(data.users);
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

	const accessChat = async (userId) => {
		try {
			setLoadingChat(true);
			const config = {
				headers: {
					"Content-type": "application/json",
					Authorization: "Bearer " + userInfo.token,
				},
			};
			const { data } = await axios.post(
				`${serverUrl}/api/chats`,
				{ userId },
				config
			);
			// console.log(data);
			// setSelectedChat(data);
			dispatch({
				type: "SELECT_CHAT",
				selectedChat: data,
			});
			setLoadingChat(false);
			onClose();
		} catch (err) {
			toast({
				title: "Error fetching chat",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	return (
		<>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				bg="white"
				w="100%"
				p="5px 10px 5px 10px"
				borderWidth="5px"
			>
				<Tooltip label="search users to chat" hasArrow placement="bottom-end">
					<Button variant="ghost" onClick={onOpen}>
						<i className="fa-solid fa-magnifying-glass"></i>
						<Text display={{ base: "none", md: "flex" }} px={4}>
							Search User
						</Text>
					</Button>
				</Tooltip>
				<Text fontSize="2xl" fontFamily="Work sans">
					Connect
				</Text>
				<div>
					<Menu>
						<MenuButton p={1}>
							<BellIcon fontSize="2xl" m={1} />
						</MenuButton>
						<MenuList>
							{notifications.length === 0
								? "No New Messages"
								: notifications.map((notif) => (
										<MenuItem
											key={notif._id}
											onClick={() => {
												dispatch({
													type: "SELECT_CHAT",
													selectedChat: notif.chat,
												});
												dispatch({
													type: "SET_NOTIFICATIONS",
													notifications: notifications.filter(
														(n) => n !== notif
													),
												});
											}}
										>
											{notif.chat.isGroupChat
												? `New message in ${notif.chat.chatName}`
												: `New message from ${getSender(
														userInfo,
														notif.chat.users
												  )}`}
										</MenuItem>
								  ))}
						</MenuList>
					</Menu>
					<Menu>
						<MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
							<Avatar
								size="sm"
								cursor="pointer"
								name={userInfo.name}
								src={userInfo.pic}
							/>
						</MenuButton>
						<MenuList>
							<ProfileModal userInfo={userInfo}>
								<MenuItem>My Profile</MenuItem>
							</ProfileModal>
							<MenuDivider />
							<MenuItem as={Button} onClick={logoutHandler}>
								Logout
							</MenuItem>
						</MenuList>
					</Menu>
				</div>
			</Box>
			<Drawer placement="left" onClose={onClose} isOpen={isOpen}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader>Search Users</DrawerHeader>
					<DrawerBody>
						<Box display="flex" pb={2}>
							<Input
								placeholder="search by name or email"
								mr={2}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
							<Button onClick={handleSearch}>Go</Button>
						</Box>
						{loading ? (
							<ChatLoading />
						) : (
							searchResult?.map((user) => (
								<UserListItem
									key={user._id}
									user={user}
									handleFunction={() => accessChat(user._id)}
								/>
							))
						)}
						{loadingChat && <Spinner ml="auto" display="flex" />}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default SideDrawer;
