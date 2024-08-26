'use client'
import React, { useState, useEffect } from 'react';

const Weather: React.FC = () => {
  const [city, setCity] = useState<string>('London');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
      if (data.location && data.location.name) {
        setCity(data.location.name);
      }
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

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`http://api.weatherstack.com/autocomplete?access_key=b8eb6c708e80f0eb9a34b43aa9bf276f&query=${query}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Suggestions data:', data); // Debugging log
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  useEffect(() => {
    if (city.length >= 3) {
      fetchSuggestions(city);
    } else {
      setSuggestions([]);
    }
  }, [city]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchWeatherData(city);
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

  const handleSuggestionClick = (suggestion: string) => {
    setCity(suggestion);
    setSuggestions([]);
    fetchWeatherData(suggestion);
  };

  return (
    <div>
      <h1 className='text-2xl font-semibold pb-10'>Weather app</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="city"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border p-2"
        />
        <button type="submit" className="ml-2 p-2 bg-blue-500 text-white">Get Weather</button>
      </form>
      <button onClick={handleGetLocation} className="mt-4 p-2 bg-green-500 text-white">Use My Location</button>
      {suggestions.length > 0 && (
        <ul className="border p-2 mt-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer p-1 hover:bg-gray-200"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {weatherData && weatherData.current && (
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