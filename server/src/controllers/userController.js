import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import generateToken from "../config/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, pic } = req.body;

	if (!name || !email || !password) {
		res.status(400);
		throw new Error("Please enter all the fields");
	}

	const userExists = await User.findOne({ email });
	if (userExists) {
		res.status(400);
		throw new Error("User already exists!");
	}

	const user = await User.create({ name, email, password, pic });
	if (user) {
		const token = generateToken(user._id);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			pic: user.pic,
			token,
		});
	} else {
		res.status(400);
		throw new Error("Failed to create user!");
	}
});

export const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (user && (await user.matchPassword(password))) {
		const token = generateToken(user._id);
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			pic: user.pic,
			token,
		});
	} else {
		res.status(401);
		throw new Error("Invalid Email or Password");
	}
});

export const getAllUsers = asyncHandler(async (req, res) => {
	const keyword = req.query.search
		? {
				$or: [
					{
						name: { $regex: req.query.search, $options: "i" },
						email: { $regex: req.query.search, $options: "i" },
					},
				],
		  }
		: {};
	const users = await User.find(keyword).find({ _id: { $ne: req.user.id } });

	res.send({ users });
});
