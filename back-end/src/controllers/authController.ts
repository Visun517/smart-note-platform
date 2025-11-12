import { Request, Response } from "express";
import { User } from "../models/user.modle";
import bcrypt from "bcryptjs";


export const userRegister = async (req: Request, res: Response) => {

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required...!" });
    }

    const exsitingUser = await User.findOne({ email });
    if (exsitingUser) {
      return res.status(400).json({ message: "User already exists...!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User Registered Successfully...!", data: newUser });

  } catch (error) {
    res.status(500).json({ message: "User Registration Failed...!" });
  }
}