import express from 'express';
import cors from 'cors';
import connectDB from './Config/connectToDatabase.js';
import UserRouter from './Routes/userProfileRoute.js';
import ProductRouter from './Routes/ProductRouter.js';
import ReviewRouter from './Routes/ReviewRouter.js'
import dotenv from 'dotenv/config';
import cookieParser from "cookie-parser";

const corsOptions = {
  origin: 'http://localhost:5173',  // Your frontend origin
  credentials: true, // This allows the server to accept cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Allowed methods

};

const app = express();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use('/profile-picture', express.static("profilePics"));
app.use(express.urlencoded({ extended: true }));
connectDB();

app.use('/api/user', UserRouter);
app.use('/api/product', ProductRouter);
app.use('/api/review', ReviewRouter)

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.status) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});