import productModel from "../models/product.model.js";
import { uploadFile } from '../services/storage.service.js'


export async function createProduct(req, res) {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

    const product = await productModel.create({
        title,
        description,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })

    res.status(201).json({
        message: "Product created Sucessfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user;
    const products = await productModel.find({ seller: seller._id });

    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts(req, res) {
    const products = await productModel.find();

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getProductDetailsById(req, res) {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        });
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    });
}

export async function addProductVariant(req, res) {
    try {
        const productId = req.params.ProductId; 
        let { stock, attributes, price } = req.body;
        let{ priceAmount, priceCurrency } = price;

        const product = await productModel.findOne({ _id: productId, seller: req.user._id });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
        }

        // Parse attributes if sent as string from FormData
        if (typeof attributes === 'string') {
            try {
                attributes = JSON.parse(attributes);
            } catch (e) {
                attributes = {};
            }
        }

        // Parse price if sent as string from FormData or separate fields
        if (typeof priceAmount === 'string') {
            try {
                priceAmount = JSON.parse(priceAmount);
            } catch (e) {
                priceAmount = req.body.priceAmount;
            }
        }

        if (typeof priceCurrency === 'string') {
            try {
                priceCurrency = JSON.parse(priceCurrency);
            } catch (e) {
                priceCurrency = req.body.priceCurrency;
            }
        }

        let variantImages = [];

        // If files uploaded from device
        const files = req.files || (req.file ? [req.file] : []);
        if (files && files.length > 0) {
            (await Promise.all(files.map(async (file) => {
                const image = await uploadFile({
                    buffer: file.buffer,
                    fileName: file.originalname
                });
                return image;
            }))).map(image => variantImages.push(image));
            
        } else if (req.file) {
            const uploaded = await uploadFile({
                buffer: req.file.buffer,
                fileName: req.file.originalname
            });
            variantImages = [uploaded];
        } else if (req.body.image) {
            const img = req.body.image;
            variantImages = Array.isArray(img) ? img.map(i => typeof i === 'string' ? { url: i } : i) : [{ url: typeof img === 'string' ? img : img.url }];
        } else if (product.images && product.images.length > 0) {
            variantImages = [{ url: product.images[0].url }];
        } else {
            variantImages = [{ url: "/clothing_brand_login.jpg" }];
        }

        const newVariant = {
            image: variantImages,
            stock: Number(stock) >= 0 ? Number(stock) : 0,
            attributes: attributes || {},
            price: {
                amount: String(priceAmount || product.price?.amount || "0"),
                currency: priceCurrency || product.price?.currency || "INR"
            }
        };

        product.variants.push(newVariant);
        await product.save();

        return res.status(201).json({
            success: true,
            message: "Variant added successfully",
            product
        });
    } catch (error) {
        console.error("Error adding variant:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to add variant" });
    }
}

export async function updateVariantStock(req, res) {
    try {
        const productId = req.params.ProductId || req.params.id;
        const { variantId } = req.params;
        const { stock } = req.body;
        const seller = req.user;

        const product = await productModel.findOne({ _id: productId, seller: seller._id });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
        }

        const variant = product.variants.id(variantId);
        if (!variant) {
            return res.status(404).json({ success: false, message: "Variant not found" });
        }

        variant.stock = Math.max(0, Number(stock) || 0);
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Variant stock updated successfully",
            product
        });
    } catch (error) {
        console.error("Error updating stock:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to update stock" });
    }
}

export async function deleteVariant(req, res) {
    try {
        const productId = req.params.ProductId || req.params.id;
        const { variantId } = req.params;
        const seller = req.user;

        const product = await productModel.findOne({ _id: productId, seller: seller._id });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
        }

        product.variants.pull({ _id: variantId });
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Variant removed successfully",
            product
        });
    } catch (error) {
        console.error("Error deleting variant:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to delete variant" });
    }
}

export async function updateAllVariants(req, res) {
    try {
        const productId = req.params.ProductId || req.params.id;
        const { variants } = req.body;
        const seller = req.user;

        const product = await productModel.findOne({ _id: productId, seller: seller._id });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
        }

        product.variants = variants;
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Variants updated successfully",
            product
        });
    } catch (error) {
        console.error("Error updating variants:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to update variants" });
    }
}