import { Router } from 'express';
import Station from '../models/Station.js';
import Booking from '../models/Booking.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get owner dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const stations = await Station.find({ owner: req.user.id });
    const stationIds = stations.map(s => s._id);
    const bookings = await Booking.find({ station: { $in: stationIds } });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.cost || 0), 0);
    const activeChargers = stations.reduce((sum, s) => sum + s.chargers.filter(c => c.status !== 'faulty').length, 0);
    const faultyChargers = stations.reduce((sum, s) => sum + s.chargers.filter(c => c.status === 'faulty').length, 0);

    res.json({
      totalRevenue,
      monthlyRevenue: Math.round(totalRevenue * 0.23),
      totalBookings: bookings.length,
      activeChargers,
      faultyChargers,
      stations: stations.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const stations = await Station.find({ owner: req.user.id });
    const stationIds = stations.map(s => s._id);
    const bookings = await Booking.find({ station: { $in: stationIds } });

    res.json({
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle charger status
router.patch('/station/:stationId/charger/:chargerId', auth, async (req, res) => {
  try {
    const station = await Station.findOne({ _id: req.params.stationId, owner: req.user.id });
    if (!station) return res.status(404).json({ message: 'Station not found' });

    const charger = station.chargers.id(req.params.chargerId);
    if (!charger) return res.status(404).json({ message: 'Charger not found' });

    if (req.body.status) charger.status = req.body.status;
    await station.save();

    // Recalculate available slots
    station.availableSlots = station.chargers.filter(c => c.status === 'available').length;
    station.status = station.availableSlots === 0 ? 'full' : station.availableSlots <= 1 ? 'limited' : 'available';
    await station.save();

    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
