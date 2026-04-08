import axios from 'axios';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
}

export async function getWeatherData(city: string): Promise<WeatherData> {
  // In production, this would call OpenWeatherMap API
  // For this lab, we return mock data
  
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (apiKey) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: city,
            appid: apiKey,
            units: 'metric'
          }
        }
      );
      
      return {
        city: response.data.name,
        temperature: response.data.main.temp,
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        pressure: response.data.main.pressure
      };
    } catch (error) {
      console.error('API call failed, using mock data');
    }
  }
  
  // Mock data for development
  return {
    city,
    temperature: Math.floor(Math.random() * 30) + 5,
    description: ['Sunny', 'Cloudy', 'Rainy', 'Partly cloudy'][Math.floor(Math.random() * 4)],
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 15) + 2,
    pressure: Math.floor(Math.random() * 50) + 990
  };
}
