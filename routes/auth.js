import express from 'express';
import User from "../models/user.js";
import { userAuth } from '../middleware/userAuth.js';

const authRouter = express.Router();
const HARDCODED_OTP = "123456";

authRouter.post('/signup', async (req, res) => {
  const { name, phoneNo, otp, password } = req.body;

  if (!name || !phoneNo || !otp || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingUser = await User.findOne({ phoneNo });
  if (existingUser) {
    return res.status(400).json({ error: "Phone number already in use" });
  }
    
  if (otp !== HARDCODED_OTP) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  try {
    const user = new User({ name, phoneNo, password });
    await user.save();
    const token = await user.getJWT();
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
    return res.status(201).json({ 
      message: "User created and signed in successfully", 
      user: { name: user.name, phoneNo: user.phoneNo } 
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post('/signin', async (req, res) => {
  const { phoneNo, password, otp } = req.body;

  if (!phoneNo || !password || !otp) {
    return res.status(400).json({ error: "Enter all required fields" });
  }

  if(otp != HARDCODED_OTP){
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const user = await User.findOne({ phoneNo });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = await user.getJWT();
  res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
  return res.status(200).json({ 
    message: "Sign in successful", 
    user: { name: user.name, phoneNo: user.phoneNo } 
  });
});

authRouter.post('/signout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: "Sign out successful" });
});

authRouter.get("/user_details", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("name phoneNo");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      user:user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
});

export default authRouter;