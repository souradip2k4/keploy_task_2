// require('dotenv').config({path: '../.env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "../.env" });
connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () =>
    console.log("Server running successfully at: ", process.env.PORT),
  );
});
