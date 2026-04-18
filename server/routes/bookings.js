import { Router } from 'express';
import Booking from '../models/Booking.js';
import auth from '../middleware/auth.js';

const router = Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, user: req.user.id });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my bookings
router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id, status: { $in: ['upcoming'] } },
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found or cannot be cancelled' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get bookings for a station (owner)
router.get('/station/:stationId', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ station: req.params.stationId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
