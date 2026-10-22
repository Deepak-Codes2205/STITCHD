import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const productSchema = new mongoose.Schema({

    title:{
        type: String,
        required: true
    },
    description: {
        type: String,
        requierd: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    price: {
        amount: {
            type: String,
            required: true
        },
        currency: {
            type: String,
            enum: ["USD", "EUR", "GBP", "JPY", "INR"],
            default: "INR"
        }
    },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    variants: [
    {
        image: [
            {
                url: {
                    type: String,
                    required: true
                }
            }
        ],
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        attributes: {
            type: Map,
            of: String,
            required: true
        },
        price: {
            amount: {
                type: String,
                required: true
            },
            currency: {
                type: String,
                enum: ["USD", "EUR", "GBP", "JPY", "INR"],
                default: "INR"
            }
        }
    }],

},{timestamps: true}

)

const productModel = mongoose.model('product', productSchema);

export default productModel;