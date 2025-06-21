import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});
const connectDB = async () => {
  console.log(process.env.MONGODB_URI);

  try {
    const connectInstance = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });
    console.log(
      `\n MongoDB connected successfully !! DB HOST: ${connectInstance.connection.host}`,
    );

    // console.log(`\n ${connectInstance}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
