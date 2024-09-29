import { ReviewModel } from '../Models/ReviewModel.js';
import { productModel } from '../Models/ProductModel.js';
import mongoose from 'mongoose';

// Add a new review
export const addReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;
        console.log('your user id is ', userId);
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const newReview = new ReviewModel({
            productId,
            rating,
            comment,
            addedBy: userId
        });
        await newReview.save();
        res.status(201).json({ message: 'Review added successfully', review: newReview });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all reviews for a product (optional filtering by product)
export const getAllReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        const reviews = await ReviewModel.find({ productId: new mongoose.Types.ObjectId(id) })
            .populate('addedBy', 'username email')
            .populate('productId', 'name');
        res.status(200).json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get a single review by ID
export const getSingleReview = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // Find review by ID
        const review = await ReviewModel.findById(id)
            .populate('addedBy', 'username email')
            .populate('productId', 'name');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a review by ID
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        // Find review by ID and update it
        const updatedReview = await ReviewModel.findByIdAndUpdate(
            id,
            {
                rating,
                comment
            },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review updated successfully', review: updatedReview });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a single review by ID
export const deleteSingleReview = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedReview = await ReviewModel.findByIdAndDelete(id);

        if (!deletedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
