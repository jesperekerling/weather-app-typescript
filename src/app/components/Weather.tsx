'use client'
import React, { useState, useEffect } from 'react';

const Weather: React.FC = () => {
  const [city, setCity] = useState<string>('Stockholm');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://api.weatherstack.com/current?access_key=b8eb6c708e80f0eb9a34b43aa9bf276f&query=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(city);
  }, [city]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.elements.namedItem('city') as HTMLInputElement;
    setCity(input.value);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(`${latitude},${longitude}`);
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div>
      <h1 className='text-2xl font-semibold pb-10'>Weather app</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="city"
          placeholder="Enter city name"
          defaultValue={city}
          className="border p-2"
        />
        <button type="submit" className="ml-2 p-2 bg-blue-500 text-white">Get Weather</button>
      </form>
      <button onClick={handleGetLocation} className="mt-4 p-2 bg-green-500 text-white">Use My Location</button>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {weatherData && (
        <div>
          <p>Temperature: <span className='font-bold'>{weatherData.current.temperature}°C</span></p>
          <p>Weather Descriptions: {weatherData.current.weather_descriptions.join(', ')}</p>
          <p>Wind Speed: {weatherData.current.wind_speed} km/h</p>
          <p>Humidity: {weatherData.current.humidity}%</p>
        </div>
      )}
    </div>
  );
};

export default Weather;