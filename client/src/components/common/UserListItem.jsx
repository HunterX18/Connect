import React from "react";
import { Avatar, Box, Text } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
	return (
		<Box
			onClick={handleFunction}
			cursor="pointer"
			display="flex"
			alignItems="center"
			borderRadius="lg"
			w="100%"
			_hover={{
				background: "#38B2AC",
				color: "black",
			}}
			px={3}
			py={2}
			mb={2}
			background="#E8E8E8"
		>
			<Avatar
				mr={2}
				size="sm"
				cursor="pointer"
				name={user.name}
				src={user.pic}
			/>
			<Box>
				<Text>{user.name}</Text>
				<Text fontSize="xs">
					<b>Email: </b>
					{user.email}
				</Text>
			</Box>
		</Box>
	);
};

export default UserListItem;
