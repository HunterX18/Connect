import { ViewIcon } from "@chakra-ui/icons";
import {
	IconButton,
	useDisclosure,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Text,
	Button,
	Image,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { StateContext } from "../../context/StateContext";

const ProfileModal = ({ userInfo, children }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	return (
		<>
			{children ? (
				<span onClick={onOpen}>{children}</span>
			) : (
				<IconButton
					display={{ base: "flex" }}
					icon={<ViewIcon />}
					onClick={onOpen}
				/>
			)}
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize="40px"
						fontFamily="Work sans"
						display="flex"
						justifyContent="center"
					>
						{userInfo.name}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody
						display="flex"
						flexDirection="column"
						alignItems="center"
						justifyContent="space-between"
					>
						<Image
							borderRadius="full"
							boxSize="150px"
							src={userInfo.pic}
							alt={userInfo.name}
						/>
						<Text
							fontSize={{ base: "28px", md: "30px" }}
							fontFamily="Work sans"
						>
							Email: {userInfo.email}
						</Text>
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default ProfileModal;
