import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';

dotenv.config();
const app = express();

app.use(express.json());
const PORT = process.env.PORT || 5000


connectDB().then(() => {
    app.listen(PORT, () =>{
    console.log(`App is listening on port ${PORT}`)
})
})
