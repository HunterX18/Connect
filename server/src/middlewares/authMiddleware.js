import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		try {
			token = req.headers.authorization.split(" ")[1];
			req.user = jwt.verify(token, process.env.JWT_SECRET);
			next();
		} catch (err) {
			res.status(401);
			throw new Error("Not authorized, token failed");
		}
	}
	if (!token) {
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});
