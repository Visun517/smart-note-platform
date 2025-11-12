import { Router } from "express";
import { userLogin, userRegister } from "../controllers/authController";

const authRouter = Router();

authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);

export default authRouter