import { productModel } from "../Models/ProductModel.js"
import uploadToCloudinary from '../Services/uploadToCloudinary.js'

export const addProduct = async (req, res) => {

    try {
        const {
            name,
            brand,
            category,
            rating,
            price,
            description,
            inventory
        } = req.body;
        console.log('object', req.body)

        let productImage = 'default.jpg';
        // Check if a file was uploaded
        if (req.file) {
            console.log('File received, starting Cloudinary upload');
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                productImage = uploadResult.secure_url;
                console.log('profilepicurl', productImage)
            } catch (uploadError) {
                console.error('Error during Cloudinary upload:', uploadError);
                return res.status(500).send('Error uploading image to Cloudinary');
            }
        }
        if (!name || !brand || !category || !price || !inventory) {
            return res.status(400).json({ message: "Please provide all required fields." });
        }
        const newProduct = new productModel({
            name,
            brand,
            category,
            images: productImage,
            rating: rating || 0,
            price,
            description,
            inStock: true,
            inventory,
            addedBy: req.user._id,
        });
        // Save the product to the database
        const savedProduct = await newProduct.save();
        console.log('product Added Sucessfully')
        return res.status(201).json({
            message: "Product added successfully",
            product: savedProduct
        });
    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getAllProducts = async (req, res) => {
    try {
        let query = {};
        let sortArg = {};

        // db.products.find({}).sort({category: -1})
        // db.products.find({}).sort({category: 1})
        // db.products.find({}).sort({price: 1})
        // db.products.find({}).sort({price: -1})

        // db.product.find({price: {$eq: 10000}})
        // db.product.find({price: {$gt: 10000}})
        // db.product.find({price: {$lt: 10000}})
        // db.product.find({price: {$lte: 10000}})
        // db.product.find({price: {$gte: 10000}})
        if (req.query.brand) {
            query.brand = req.query.brand;
        }
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.sortBy && req.query.sort) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.sort.toLowerCase() === "asc" ? 1 : -1;
            sortArg[sortField] = sortOrder;

        }
        if (req.query.price) {
            const priceOperators = {
                "=": "$eq",
                "<": "$lt",
                ">": "$gt",
                "<=": "$lte",
                ">=": "$gte",
            };
            // [=, <, >, <=, >=]
            Object.keys(priceOperators).forEach((operator) => {
                if (req.query.price.startsWith(operator)) {
                    query.price = {
                        [priceOperators[operator]]: req.query.price.slice(operator.length),
                    };
                }
            });
        }
        if (req.query.name) {
            query.name = { $regex: req.query.name, $options: "i" };
        }
        //added by
        if (req.query.minPrice && req.query.maxPrice) {
            query.price = {
                $gte: req.query.minPrice,
                $lte: req.query.maxPrice
            };
        } else if (req.query.minPrice) {
            query.price = { $gte: req.query.minPrice };
        } else if (req.query.maxPrice) {
            query.price = { $lte: req.query.maxPrice };
        }

        if (req.query.rating) {
            const ratingOperators = {
                "=": "$eq",
                "<": "$lt",
                ">": "$gt",
                "<=": "$lte",
                ">=": "$gte",
            };

            Object.keys(ratingOperators).forEach((operator) => {
                if (req.query.rating.startsWith(operator)) {
                    query.rating = {
                        [ratingOperators[operator]]: req.query.rating.slice(operator.length),
                    };
                }
            });
        }
        const allProducts = await productModel.find(query).sort(sortArg);
        return res.status(200).json({
            message: "Products retrieved successfully",
            products: allProducts
        });
    } catch (error) {
        console.error("Error retrieving products:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getSingleProducts = async (req, res) => {
    try {
        const idToFind = req.params.id;
        const singleProduct = await productModel.findById(idToFind);

        if (!singleProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        return res.status(200).json({
            message: "Product retrieved successfully",
            product: singleProduct
        });
    } catch (error) {
        console.error("Error retrieving product:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}
export const deleteSingleProduct = async (req, res) => {

    try {
        const idToDelete = req.params.id;
        const singleProduct = await productModel.findByIdAndDelete(idToDelete);
        if (!singleProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        return res.status(200).json({
            message: "Product deleted successfully",
            product: singleProduct
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const updateProduct = async (req, res) => {
    console.log('API called for updating product', req.params.id);

    try {
        const productId = req.params.id;
        let updatedFields = { ...req.body };
        console.log(updatedFields);
        let productImage = 'default.jpg'
        // Check if a file was uploaded
        if (req.file) {
            console.log('File received, starting Cloudinary upload');

            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer);
                productImage = uploadResult.secure_url;
                console.log('Image URL from Cloudinary:', productImage);
                updatedFields.images = [productImage];
            } catch (uploadError) {
                console.error('Error during Cloudinary upload:', uploadError);
                return res.status(500).send('Error uploading image to Cloudinary');
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            productId,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

