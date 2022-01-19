import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const { PORT } = process.env;

const app = express();

// parse request body as json
app.use(express.json());

// use cors
app.use(cors());

// Define route handlers
app.use("/nfts", require("./routes/nfts"));

// Start application
app.listen(PORT, () => {
  console.log("server started at port " + PORT);
});