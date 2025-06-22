import React, { useState, useEffect } from "react";
import axios from "axios";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Apply dark mode class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Load recent searches
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentCities")) || [];
    setRecentSearches(saved);
  }, []);

  const saveCity = (cityName) => {
    let updated = [cityName, ...recentSearches.filter((c) => c !== cityName)];
    if (updated.length > 5) updated = updated.slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentCities", JSON.stringify(updated));
  };

  const fetchWeather = async (selectedCity = city) => {
    if (!selectedCity.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${API_KEY}&units=metric`
      );
      setWeather(response.data);
      saveCity(response.data.name);
    } catch (error) {
      setError("City not found or API error.");
    } finally {
      setLoading(false);
    }
  };

  const fetchByLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          setWeather(response.data);
          saveCity(response.data.name);
        } catch (err) {
          setError("Location weather fetch failed.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Location access denied.");
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-6 rounded-2xl shadow-xl w-full max-w-md relative">
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="absolute top-4 right-4 bg-gray-300 dark:bg-gray-700 text-xs text-black dark:text-white px-2 py-1 rounded"
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>

        <h2 className="text-2xl font-semibold text-center mb-6">🌦️ Weather App</h2>

        <input
          type="text"
          placeholder="Enter City Name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-800 text-black dark:text-white"
        />

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => fetchWeather()}
            className="w-1/2 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {loading ? "Loading..." : "Get Weather"}
          </button>
          <button
            onClick={fetchByLocation}
            className="w-1/2 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📍 My Location
          </button>
        </div>

        {error && (
          <p className="mb-4 text-red-600 text-center font-medium">{error}</p>
        )}

        {recentSearches.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">
              Recent Searches:
            </h4>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((cityName, idx) => (
                <button
                  key={idx}
                  onClick={() => fetchWeather(cityName)}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm px-3 py-1 rounded"
                >
                  {cityName}
                </button>
              ))}
            </div>
          </div>
        )}

        {weather && !error && (
          <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold mb-2">
              {weather.name}, {weather.sys?.country}
            </h3>

            <img
              src={`https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}@2x.png`}
              alt="weather icon"
              className="mx-auto mb-2"
            />

            <p className="text-lg font-medium capitalize">
              {weather.weather?.[0]?.description}
            </p>

            <p className="text-xl font-semibold mt-2">
              🌡️ {weather.main?.temp}°C
            </p>

            <div className="mt-4 text-sm space-y-1">
              <p>💧 Humidity: {weather.main?.humidity}%</p>
              <p>🌬️ Wind Speed: {weather.wind?.speed} m/s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;
