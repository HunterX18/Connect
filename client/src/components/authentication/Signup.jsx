import {
	FormControl,
	FormLabel,
	InputGroup,
	InputRightElement,
	VStack,
} from "@chakra-ui/react";
import { Button, Input, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [picFile, setPicFile] = useState();
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();

	const handleClick = () => {
		setShow(!show);
	};

	const postDetails = (pic) => {
		if (pic === undefined) {
			toast({
				title: "Please select an image",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}
		if (pic.type === "image/jpeg" || pic.type === "image/png") {
			setPicFile(pic);
		} else {
			toast({
				title: "Please select an image",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}
	};

	const submitHandler = async () => {
		setLoading(true);
		if (!name || !email || !password || !confirmPassword) {
			toast({
				title: "Please fill all the fields",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}
		if (password !== confirmPassword) {
			toast({
				title: "Passwords do not match",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}
		try {
			const picData = new FormData();
			picData.append("file", picFile);
			picData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
			picData.append("cloud_name", process.env.REACT_APP_CLOUD_NAME);
			const res = await fetch(process.env.REACT_APP_CLOUDINARY_API, {
				method: "post",
				body: picData,
			});
			const resData = await res.json();
			const pic = resData.url.toString();
			const config = {
				headers: {
					"Content-type": "application/json",
				},
			};
			const { data } = await axios.post(
				"http://localhost:5000/api/user",
				{
					name,
					email,
					password,
					pic,
				},
				config
			);
			toast({
				title: "Successfully signed up",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			localStorage.setItem("userInfo", JSON.stringify(data));
			setLoading(false);
			navigate("/chats");
		} catch (error) {
			toast({
				title: "An error occurred",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	return (
		<VStack spacing="5px">
			<FormControl id="first-name" isRequired>
				<FormLabel>Name</FormLabel>
				<Input
					placeholder="Enter your name"
					onChange={(e) => {
						setName(e.target.value);
					}}
				/>
			</FormControl>
			<FormControl id="email" isRequired>
				<FormLabel>Email</FormLabel>
				<Input
					placeholder="Enter your email"
					onChange={(e) => {
						setEmail(e.target.value);
					}}
				/>
			</FormControl>
			<FormControl id="password" isRequired>
				<FormLabel>Password</FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "password"}
						placeholder="Enter your password"
						onChange={(e) => {
							setPassword(e.target.value);
						}}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "hide" : "show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<FormControl id="confirm-password" isRequired>
				<FormLabel>Confirm Password</FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "password"}
						placeholder="Confirm your password"
						onChange={(e) => {
							setConfirmPassword(e.target.value);
						}}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "hide" : "show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<FormControl id="pic">
				<FormLabel>Upload your picture</FormLabel>
				<InputGroup>
					<Input
						type="file"
						p={1.5}
						accept="image/*"
						onChange={(e) => {
							postDetails(e.target.files[0]);
						}}
					/>
				</InputGroup>
			</FormControl>
			<Button
				colorScheme="blue"
				width="100%"
				style={{ marginTop: 15 }}
				onClick={submitHandler}
				isLoading={loading}
			>
				Sign up
			</Button>
		</VStack>
	);
};

export default Signup;
