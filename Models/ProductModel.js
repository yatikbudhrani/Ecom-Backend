import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    images: [{
        type: String,
        trim: true
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    inStock: {
        type: Boolean,
        default: true
    },
    inventory: {
        type: Number,
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }
});

export const productModel = mongoose.model('product', productSchema);
