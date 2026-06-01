const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Clean import for auth token generation
const Booking = require('../models/Booking');

// Simple key for token signatures (Keep it safe; move to your .env file later)
const JWT_SECRET = process.env.JWT_SECRET || "ROYENZA_SUPER_SECRET_KEY_123";

// ==========================================
// SECURITY MIDDLEWARE (Protects your admin routes)
// ==========================================
const adminAuth = (req, res, next) => {
  // Read the cookie from the browser securely
  const token = req.cookies.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. Please login first.' });
  }

  try {
    // Decrypt and confirm the token signature
    const verified = jwt.verify(token, JWT_SECRET);
    req.admin = verified;
    next(); // Pass control down to your database queries
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

// ==========================================
// AUTH ROUTING (Login / Logout management)
// ==========================================

// 1. ADMIN LOGIN (Drops secure HTTP-only cookie)
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple credential validation block matching your admin panel inputs
    if (username === 'royenzaadmin' && password === 'royenzaadmin69') {
      
      // Generate a clean secure payload session token valid for 1 day
      const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

      // Save the token straight into an HTTP-only browser cookie container
      res.cookie('adminToken', token, {
        httpOnly: true, // Safeguards against cross-site script reading (Great for your marks!)
        secure: false,  // Keep false for localhost. Flip to true during your live cloud deployment!
        maxAge: 24 * 60 * 60 * 1000 // Lifespan set to exactly 24 hours
      });

      return res.status(200).json({ success: true, message: 'Welcome to Royenza Dashboard' });
    }

    res.status(401).json({ success: false, message: 'Invalid username or password' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. ADMIN LOGOUT (Clears cookie cache)
router.post('/admin/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// PROTECTED API ENDPOINTS (Admin Authorization required)
// ==========================================

// 3. GET ALL: Fetch all reservations for the Admin Dashboard
router.get('/all', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ _id: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve reservations.' });
  }
});

// 4. UPDATE: Modify booking status (Accept/Pending/Cancel)
router.put('/:bookingId/status', adminAuth, async (req, res) => {
  try {
    const id = req.params.bookingId.trim();
    const status = req.body.status.trim();

    // Find by bookingId and update its status field directly
    const updatedBooking = await Booking.findOneAndUpdate(
      { bookingId: id },
      { status: status },
      { new: true } // Returns the updated document
    );

    if (!updatedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. DELETE: Cancel and permanently delete a reservation
router.delete('/:bookingId', adminAuth, async (req, res) => {
  try {
    const id = req.params.bookingId.trim();
    
    const deletedBooking = await Booking.findOneAndDelete({ bookingId: id });
    
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// PUBLIC API ENDPOINTS (Accessible to anyone)
// ==========================================

// 6. SEARCH BY PHONE/WHATSAPP (Direct exact match)
router.get('/search/phone/:phoneNumber', async (req, res) => {
  try {
    const phone = req.params.phoneNumber.trim();

    // Find any booking where either phone OR whatsapp matches exactly
    const bookings = await Booking.find({
      $or: [
        { phone: phone },
        { whatsapp: phone }
      ]
    }).sort({ _id: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching by phone number.' });
  }
});

// 7. SEARCH BY BOOKING ID (Direct exact match)
router.get('/search/id/:bookingId', async (req, res) => {
  try {
    const id = req.params.bookingId.trim();

    // Find booking matching the ID exactly
    const bookings = await Booking.find({ bookingId: id }).sort({ _id: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching by Booking ID.' });
  }
});

// 8. CREATE: Save confirmed booking after payment
router.post('/create', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({ success: true, booking: savedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;