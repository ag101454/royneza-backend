const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  vehicleModel: { type: String, required: true },
  vehicleColor: { type: String, required: true },
  parkingSlot: { type: String, required: true }
});

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true }, // For target CRUD lookups
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  bookingDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  guests: { type: Number, required: true },
  tableType: { type: String, required: true },
  needParking: { type: Boolean, required: true },
  status: { type: String, default: 'Payment Pending' },
  parking: { type: ParkingSchema, default: null }, // Embedded object if parking is used
  payment: { type: Object, default: null },        // Transaction metadata from modal
  createdAt: { type: String, required: true }
});

module.exports = mongoose.model('Booking', BookingSchema);