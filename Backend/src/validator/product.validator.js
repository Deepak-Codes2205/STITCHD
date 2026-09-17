import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next){

    const errors = validateRequest(req);

    if(!errors.isEmpty()){
        return res.status(400).json({
            message: "Validation error", errors: errors.array()
        })
    }
    next();
}

export const CreateProductValidator = [
    body('title')
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long"),
    body('description')
        .notEmpty()
        .withMessage("Description is required")
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters long"),
    body('priceAmount')
        .isNumeric()
        .withMessage("Price must be a positive number"),
    body('priceCurrency')
        .notEmpty()
        .withMessage("Currency is required"),

    validateRequest
];  