import React, { useContext } from "react";
import ScrollableFeed from "react-scrollable-feed";
import isSameSender from "../../utils/isSameSender";
import isLastMessage from "../../utils/isLastMessage";
import { Avatar, Tooltip } from "@chakra-ui/react";
import { StateContext } from "../../context/StateContext";

const ScrollableChat = ({ messages }) => {
	const {
		state: { userInfo },
	} = useContext(StateContext);


	return (
		<ScrollableFeed>
			{messages.map((msg, ind) => (
				<div style={{ display: "flex" }} key={ind}>
					{(isSameSender(messages, msg, ind, userInfo._id) ||
						isLastMessage(messages, ind, userInfo._id)) && (
						<Tooltip label={msg.sender.name} placement="bottom-start" hasArrow>
							<Avatar
								mt="7px"
								mr={1}
								size="sm"
								cursor="pointer"
								name={msg.sender.name}
								src={msg.sender.pic}
							/>
						</Tooltip>
					)}
					<span
						style={{
							backgroundColor: `${
								msg.sender._id === userInfo._id ? "#BEE3F8" : "#B9F5D0"
							}`,
							margin: `${
								msg.sender._id === userInfo._id
									? "1px 0 5px auto"
									: "1px auto 5px 0"
							}`,
							borderRadius: "10px",
							padding: "5px 10px",
							maxWidth: "75%",
						}}
					>
						{msg.content}
					</span>
				</div>
			))}
		</ScrollableFeed>
	);
};

export default ScrollableChat;
