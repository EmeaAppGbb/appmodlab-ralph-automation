import { Router } from 'express';
import { getWeatherData } from '../services/weatherService';

const router = Router();

router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const weatherData = await getWeatherData(city);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:city/forecast', async (req, res) => {
  try {
    const { city } = req.params;
    // Mock forecast data
    res.json({
      city,
      forecast: [
        { date: '2024-01-01', temp: 15, description: 'Partly cloudy' },
        { date: '2024-01-02', temp: 17, description: 'Sunny' },
        { date: '2024-01-03', temp: 14, description: 'Rainy' },
        { date: '2024-01-04', temp: 16, description: 'Cloudy' },
        { date: '2024-01-05', temp: 18, description: 'Clear' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

export default router;
