import { body, validationResult } from 'express-validator';


function validateRequest(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            errors: errors.array() 
        });
    }

    next();
}


export const validateRegisterUser = [
    body('email')
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),

    body('contact.countryCode')
        .notEmpty()
        .withMessage("Country code is required")
        .matches(/^\+\d{1,4}$/)
        .withMessage("Country code must be in the format +91, +1, +44, etc."),

    body('contact.number')
        .notEmpty()
        .withMessage("Contact number is required")
        .matches(/^\d{10}$/)
        .withMessage("Contact number must be a valid 10-digit number"),

    body('password')
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 16 })
        .withMessage("Password must be between 8 and 16 characters"),

    body('fullname')
        .notEmpty()
        .withMessage("Full name is required")
        .isLength({ min: 3 })
        .withMessage("Full name must be at least 3 characters long"),

    body('isSeller')
        .isBoolean()
        .withMessage("isSeller must be a boolean value"),

    validateRequest
];