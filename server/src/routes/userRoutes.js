import { Router } from "express";
import {
	registerUser,
	authUser,
	getAllUsers,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const userRouter = Router();

userRouter.post("/", registerUser);

userRouter.post("/login", authUser);

userRouter.get("/", protect, getAllUsers);

export default userRouter;
