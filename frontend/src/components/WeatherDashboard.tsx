import React, { useState } from 'react';
import { useWeather } from '../hooks/useWeather';

const WeatherDashboard: React.FC = () => {
  const [city, setCity] = useState('London');
  const { data: weather, isLoading, error } = useWeather(city);

  if (isLoading) return <div>Loading weather data...</div>;
  if (error) return <div>Error loading weather: {error.message}</div>;

  return (
    <div className="weather-dashboard">
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {weather && (
        <div className="weather-info">
          <h2>{weather.city}</h2>
          <div className="current-weather">
            <div className="temperature">
              {weather.temperature}°C
            </div>
            <div className="description">
              {weather.description}
            </div>
          </div>

          <div className="details">
            <div className="detail-item">
              <span>Humidity:</span>
              <span>{weather.humidity}%</span>
            </div>
            <div className="detail-item">
              <span>Wind Speed:</span>
              <span>{weather.windSpeed} m/s</span>
            </div>
            <div className="detail-item">
              <span>Pressure:</span>
              <span>{weather.pressure} hPa</span>
            </div>
          </div>

          <div className="forecast">
            <h3>5-Day Forecast</h3>
            {weather.forecast?.map((day, idx) => (
              <div key={idx} className="forecast-day">
                <span>{day.date}</span>
                <span>{day.temp}°C</span>
                <span>{day.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;
