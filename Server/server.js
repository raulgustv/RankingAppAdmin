import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js'
import playerRoutes from './routes/playerRoutes.js'
import matchRoutes from './routes/matchRoute.js'


// Load environment variables from .env file
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//db
connectDB();

//Routes
app.use('/api/admin', adminRoutes);
app.use('/api/ranking', playerRoutes)
app.use('/api/match', matchRoutes)

//Port 
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});