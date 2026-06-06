const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/booking');

const app = express();

// CORS - Allow frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://royneza-restaurant.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Royneza API is running 🍽️' });
});

// MongoDB Atlas Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin123@royneza-cluster.86rijrr.mongodb.net/?retryWrites=true&w=majority&appName=royneza-cluster';

mongoose.connect(MONGO_URI, {
  dbName: 'royenzaDB'
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ Error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});