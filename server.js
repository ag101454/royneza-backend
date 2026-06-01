const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const bookingRoutes = require('./routes/booking');

const app = express();

// Middleware - Updated CORS for production
app.use(cors({
  origin: [
    'http://localhost:5173',                           // Local development
    'https://royneza-restaurant.vercel.app',           // Your Vercel frontend
    'https://royneza-frontend.vercel.app'              // Alternative Vercel URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increased limits for Base64 payment screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

// Mount Booking API routes
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Royneza API is running 🍽️',
    timestamp: new Date().toISOString()
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/royenzaDB';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to Royenza Database'))
  .catch(err => console.error('❌ Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Royenza Server running on port ${PORT}`);
});