import express from 'express';
import authMiddleware from '../Middleware/authMiddleware.js';
import multer from 'multer';
import { addReview, getAllReview, getSingleReview, deleteSingleReview, updateReview } from '../Controllers/ReviewController.js'

// Multer setup to process files in memory only
const storage = multer.memoryStorage();
const uploadPicsCloud = multer({ storage });

const ReviewRouter = express.Router();

ReviewRouter.post('/addreview', authMiddleware, addReview)
ReviewRouter.get('/getallreview/:id', getAllReview)
ReviewRouter.get('/getsinglereview/:id', getSingleReview)
ReviewRouter.delete('/deletesinglereview/:id', deleteSingleReview)
ReviewRouter.patch('/editreview/:id', updateReview);

export default ReviewRouter;