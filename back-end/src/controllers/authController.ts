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

export const userLogin = async (req: Request, res: Response) => {

  try {
    const { email, password } = req.body;

    const exsitingUser = await User.findOne({ email });
    if (!exsitingUser) {
      return res.status(401).json({ message: "Invalid creadentials...!" });
    }

    const vlaid = await bcrypt.compare(password, exsitingUser.password);

    if (!vlaid) {
      return res.status(401).json({ message: "Invalid creadentials...!" });
    }

    // token generation
    
    
    res.status(200).json({
      message: "Login successful", data: {
        email: exsitingUser.email,
        id: exsitingUser._id
        //token
      }
    });

  } catch (error) {
    res.status(500).json({ message: "User login Failed...!" });
  }
}