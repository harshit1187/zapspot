import { Router } from 'express';
import Station from '../models/Station.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get all stations (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { chargerType, vehicleType, speed, lat, lng, radius } = req.query;
    const filter = {};

    if (chargerType) filter.chargerTypes = chargerType;
    if (vehicleType) filter.vehicleTypes = vehicleType;
    if (speed) filter.speed = speed;

    let stations;
    if (lat && lng) {
      stations = await Station.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: (parseFloat(radius) || 50) * 1000
          }
        }
      });
    } else {
      stations = await Station.find(filter);
    }

    // Map to frontend format
    const formatted = stations.map(s => ({
      _id: s._id,
      name: s.name,
      address: s.address,
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
      rating: s.rating,
      totalSlots: s.totalSlots,
      availableSlots: s.availableSlots,
      chargerTypes: s.chargerTypes,
      vehicleTypes: s.vehicleTypes,
      speed: s.speed,
      pricePerKwh: s.pricePerKwh,
      amenities: s.amenities,
      status: s.status,
      image: s.image,
      chargers: s.chargers,
      openingTime: s.openingTime,
      closingTime: s.closingTime,
      owner: s.owner,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single station
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create station (owner only)
router.post('/', auth, async (req, res) => {
  try {
    const station = await Station.create({ ...req.body, owner: req.user.id });
    res.status(201).json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update station
router.patch('/:id', auth, async (req, res) => {
  try {
    const station = await Station.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );
    if (!station) return res.status(404).json({ message: 'Station not found or unauthorized' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
