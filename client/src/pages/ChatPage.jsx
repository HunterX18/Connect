import React, { useContext } from "react";
import { StateContext } from "../context/StateContext";
import SideDrawer from "../components/common/SideDrawer";
import MyChats from "../components/common/MyChats";
import ChatBox from "../components/common/ChatBox";
import { Box } from "@chakra-ui/react";

const ChatPage = () => {
	const {
		state: { userInfo },
	} = useContext(StateContext);

	return (
		<div style={{ width: "100%" }}>
			{userInfo && <SideDrawer />}
			<Box display="flex" justifyContent="space-between" w="100%" h="90vh" p="10px">
				{userInfo && <MyChats />}
				{userInfo && <ChatBox />}
			</Box>
		</div>
	);
};

export default ChatPage;
