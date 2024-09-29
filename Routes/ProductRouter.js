import express from 'express';
import authMiddleware from '../Middleware/authMiddleware.js';
import multer from 'multer';
import { addProduct, getAllProducts, getSingleProducts, deleteSingleProduct, updateProduct } from '../Controllers/ProductController.js'

// Multer setup to process files in memory only
const storage = multer.memoryStorage();
const uploadPicsCloud = multer({ storage });

const ProductRouter = express.Router();

ProductRouter.post('/addproduct', authMiddleware, uploadPicsCloud.single('image'), addProduct)
ProductRouter.get('/getallproducts', getAllProducts)
ProductRouter.get('/getsingleproduct/:id', getSingleProducts)
ProductRouter.delete('/deletesingleproduct/:id', deleteSingleProduct)
ProductRouter.patch('/editproduct/:id', uploadPicsCloud.single('image'), updateProduct);

export default ProductRouter;
