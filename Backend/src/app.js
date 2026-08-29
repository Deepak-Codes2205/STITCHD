import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import authRouter from './routes/auth.routes.js'
import cors  from "cors"

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

app.get('/', (_req, res) => {
  res.json({ message: 'STITCHD API is running' });
});

app.use('/api/auth', authRouter);

export default app;
