// const express = require("express")
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({
  path: './.env' // Explicitly point to the .env file in the root
});
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import { router as userRouter } from "./routes/user.routes.js";

// route declaration
app.use("/api/v1/users", userRouter);
// http://localhost:8000/api/v1/users/

export { app };
