import express from 'express';
import { connectDB } from './config/database.js';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/auth.js';
import recipeRouter from './routes/recipe.js';
import cusineRouter from './routes/cusine.js';
import cookieParser from 'cookie-parser';

const app = express();
dotenv.config();

const PORT = process.env.PORT

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      preflightContinue: false,
    })
  );

app.use("/api/auth", authRouter);
app.use("/api/recipe", recipeRouter)
app.use("/api/cusine", cusineRouter)

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Listening on port 4000");
    });
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });