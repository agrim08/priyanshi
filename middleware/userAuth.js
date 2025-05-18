import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

export const userAuth = async (req, res, next) => {
    try {
      const { token } = req.cookies;
      if (!token) {
        return res.status(401).send("Please Login");
      }
      const decodeObj = jwt.verify(token, process.env.JWT_SECRET);
      const { _id } = decodeObj;
      const user = await User.findById(_id);
      if (!user) {
        throw new Error("User Not Found");
      }
      req.user = user;
      next();
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  };