import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WeatherDashboard from './components/WeatherDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header>
          <h1>🌤️ WeatherLens</h1>
          <p>Your comprehensive weather dashboard</p>
        </header>
        <WeatherDashboard />
      </div>
    </QueryClientProvider>
  );
}

export default App;
