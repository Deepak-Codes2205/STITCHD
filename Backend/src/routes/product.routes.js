import express from 'express';
import { authenticateSeller } from '../middlewares/auth.middleware.js';
import { createProduct } from '../controllers/product.controller.js';
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

router.post('/', authenticateSeller, CreateProductValidator, upload.array('images', 7), createProduct)


export default router