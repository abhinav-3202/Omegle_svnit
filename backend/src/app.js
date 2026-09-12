import express from 'express';
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});
// import userRoutes from './routes/userRoutes.js';
// import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(express.json());
// app.use('/', authRoutes);
// app.use('/users', userRoutes);


export {app};