import { Router } from "express"
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js";
import { register } from '../controllers/auth.controller.js'

const router = Router();

router.post('/register', validateRegisterUser, register);

router.get('/login', validateLoginUser, login);

export default router
