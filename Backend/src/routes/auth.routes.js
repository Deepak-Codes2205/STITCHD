import { Router } from "express";
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js";
import { register, login } from '../controllers/auth.controller.js';
import passport from "passport";
import { config } from "../config/config.js"

const router = Router();

router.post('/register', validateRegisterUser, register);

router.post('/login', validateLoginUser, login);

// /api/auth/google
router.get('/google',
    passport.authenticate("google", { scope: [ "profile", "email"] })
)

//Sends Auth code to Google and get it verify and validate and brings the user data as "req.user"
router.get('/google/callback',
    passport.authenticate("google", { session: false }),
    googleCallback,
)

export default router
