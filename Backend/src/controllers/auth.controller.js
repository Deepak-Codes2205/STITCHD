import userModel from "../models/user.model";
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

async function sendTokenResponse(user, res, message){
    const token =jwt.sign({
        id: user.id
    }, config.JWT_SECRET, {
        expiresIn: "7d" 
    })

    res.cookie("token", token);

    res.status(200).json({
        message,
        sucess: true,
        user:{
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

export const register = async(req, res)=>{

    const { email, contact, password, fullname, role} = req.body;
    const { countryCode, number} = contact;

    try{

        const existingUser = await userModel.findOne({
            $or:[
                { email },
                { "contact.number": number }
            ]
        })
        
        if(existingUser){
            return res.status(400).json({
                Message: "User with this email or contact number already exists"
            })
        }

        const user = await userModel.create({
            email,
            contact: {
                countryCode,
                number
            },
            password,
            fullname,
            role

        })
        await sendTokenResponse(req, res, "User registered successfully");

    }catch(error){
        console.log(error);
        return res.status(500).json({
            message: "Server Error"
        }) 
    }
}