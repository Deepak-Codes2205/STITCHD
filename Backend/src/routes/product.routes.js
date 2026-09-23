import express from 'express';
import { authenticateSeller } from '../middlewares/auth.middleware.js';
import { createProduct, getSellerProducts } from '../controllers/product.controller.js';
import { CreateProductValidator } from '../validator/product.validator.js';
//Imagekit - Multer
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits : {
        fileSize: 5 * 1024 * 1024 //5MB
    }
})


const router = express.Router();

/**
 * @route POST /api/products
 * @desc Create a new product
 * @access Private (Seller only)
 */
router.post('/', authenticateSeller, upload.array('images', 7), CreateProductValidator, createProduct)


/**
 * @route GET /api/products/seller
 * @desc Get all products of the authenticated seller
 * @access Private (Seller only)
 */
router.get('/seller', authenticateSeller, getSellerProducts);



export default router