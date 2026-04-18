import { Router } from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = Router();

// Get reviews for a station
router.get('/station/:stationId', async (req, res) => {
  try {
    const reviews = await Review.find({ station: req.params.stationId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add review
router.post('/', auth, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, user: req.user.id });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
