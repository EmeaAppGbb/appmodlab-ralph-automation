import express from 'express';
import cors from 'cors';
import weatherRoutes from './routes/weather';
import preferencesRoutes from './routes/preferences';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/preferences', preferencesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`WeatherLens API running on port ${port}`);
});

export default app;
