import { Router } from "express"
import { validateRegisterUser } from "../validator/auth.validator.js";

const router = Router();

router.post('/register', validateRegisterUser, (req, res) => {
    // Handle the registration logic here
    res.status(200).json({ message: 'User registered successfully' });
});


export default router
