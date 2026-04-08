import { Router } from 'express';

const router = Router();

router.get('/user/:userId', async (req, res) => {
  // Mock user preferences
  res.json({
    userId: req.params.userId,
    temperatureUnit: 'celsius',
    theme: 'light',
    favoriteLocations: ['London', 'New York', 'Tokyo']
  });
});

router.post('/user/:userId', async (req, res) => {
  // Save user preferences
  const preferences = req.body;
  res.json({ success: true, preferences });
});

export default router;
