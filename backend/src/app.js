import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config({path:'./.env'});
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import {errorHandler} from './middleware/errorHandler.js';


const app = express();

app.use(cors({origin: process.env.FRONTEND_URL}));
app.use(express.json());
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/queue', queueRoutes);
app.get('/health', (_req, res) => res.send('ok'));

app.use(errorHandler);  

export {app};