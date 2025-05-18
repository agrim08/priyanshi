import express from "express";
import Cusine from "../models/cusine.js";
import { userAuth } from "../middleware/userAuth.js";

const cusineRouter = express.Router();

cusineRouter.post("/add_cusine", userAuth, async (req, res) => {
  const { name, imageUrl, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const cusine = new Cusine({ name, imageUrl, description });
    await cusine.save();
    return res.status(201).json({ message: "Cusine added successfully", cusine });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

cusineRouter.get("/get_cusine", userAuth, async (req, res) => {
  try {
    const cusines = await Cusine.find();
    return res.status(200).json(cusines);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default cusineRouter;