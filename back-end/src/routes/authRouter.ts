import { Router } from "express";
import { userRegister } from "../controllers/authController";

const authRouter = Router();

authRouter.post("/register", userRegister);

export default authRouter