import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  forecast?: Array<{
    date: string;
    temp: number;
    description: string;
  }>;
}

export const useWeather = (city: string) => {
  return useQuery<WeatherData>({
    queryKey: ['weather', city],
    queryFn: async () => {
      const response = await axios.get(`/api/weather/${city}`);
      return response.data;
    },
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
