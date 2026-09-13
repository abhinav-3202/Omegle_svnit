import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import {errorHandler} from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/', authRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);  

export {app};