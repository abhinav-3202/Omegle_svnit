import dotenv from 'dotenv';
dotenv.config({path:'./.env'});
import {app} from './app.js';
import {connectDB} from './config/db.js';

const startServer = async()=>{
    try{
        await connectDB();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT,()=>{
            console.log(`Server running on port ${PORT}`);
        });
    }catch(error){
        console.error(`Error starting server: ${error.message}`);
    }
}

startServer();