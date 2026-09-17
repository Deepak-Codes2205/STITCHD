import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import authRouter from './routes/auth.routes.js'
import productRouter from './routes/product.routes.js'
import cors  from "cors"
import  passport  from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { config } from "./config/config.js"



dotenv.config();

connectDB();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,  
}))  


app.use(passport.initialize());

passport.use( new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: config.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) =>{
    return done(null, profile);
}))

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'STITCHD API IS RUNNING' });
}); 

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);

export default app;
