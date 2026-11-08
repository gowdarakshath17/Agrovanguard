import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { WeatherManager } from '../services/weather/WeatherManager.ts';

const router = Router();
const weatherManager = new WeatherManager();

const handleWeatherContext = async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.0760; // Default to Mumbai for demo
    const lon = parseFloat(req.query.lon as string) || 72.8777;

    const weatherData = await weatherManager.getContextualWeather(lat, lon);
    res.json(weatherData);
  } catch (error: any) {
    console.error('Weather Context API Error:', error);
    res.status(503).json({ 
      error: 'Weather service temporarily unavailable',
      message: error.message 
    });
  }
};

router.get('/context', requireAuth, handleWeatherContext);
router.get('/contextual', requireAuth, handleWeatherContext);

export default router;
