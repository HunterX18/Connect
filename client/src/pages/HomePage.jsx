import React, { useEffect } from "react";
import {
	Box,
	Container,
	Text,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
} from "@chakra-ui/react";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
	const navigate = useNavigate();
	useEffect(() => {
		const userInfo = JSON.parse(localStorage.getItem("userInfo"));
		if (userInfo) {
			navigate("/chats");
		}
	}, [navigate]);
	return (
		<Container maxW="xl" centerContent>
			<Box
				d="flex"
				justifyContent="center"
				p={3}
				bg="white"
				w="100%"
				m="40px 0 15px 0"
				borderRadius="lg"
				borderWidth="1px"
			>
				<Text fontSize="4xl" fontFamily="Work sans" color="black">
					Connect
				</Text>
			</Box>
			<Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
				<Tabs variant="soft-rounded">
					<TabList mb="1em">
						<Tab w="50%">Login</Tab>
						<Tab w="50%">Sign up</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Login />
						</TabPanel>

						<TabPanel>
							<Signup />
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		</Container>
	);
};

export default HomePage;
