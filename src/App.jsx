import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCloud, FiThermometer, FiDroplet, FiWind, FiClock, FiAlertCircle, FiX, FiDatabase } from 'react-icons/fi';

const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [lastWeather, setLastWeather] = useState(null);
  const [recommendations, setRecommendations] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    setWeather(null);
    setLastWeather(null);
    setRecommendations('');
    setHistory([]);
    try {
      // Get current weather
      const weatherRes = await axios.post('https://backend1.captianjack.tech/weather', { city_name: city });
      setWeather(weatherRes.data);
      
      // Get recommendations
      const recRes = await axios.post('https://backend2.captianjack.tech/recommendations', weatherRes.data);
      setRecommendations(recRes.data.recommendations || '');

      // Store current weather and get last stored weather
      await axios.post('https://backend3.captianjack.tech/store_weather', weatherRes.data);
      const lastWeatherRes = await axios.get(`https://backend3.captianjack.tech/weather/${city}`);
      setLastWeather(lastWeatherRes.data.data || null);

      // Get history
      const historyRes = await axios.get(`https://backend3.captianjack.tech/weather/${city}`);
      setHistory(historyRes.data.history || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setCity('');
    setWeather(null);
    setLastWeather(null);
    setRecommendations('');
    setHistory([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 p-4 md:p-8 flex items-center justify-center text-gray-100">
      <div className="max-w-4xl w-full bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <motion.h1 
            whileHover={{ scale: 1.02 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-50 flex items-center justify-center gap-2"
          >
            <FiCloud className="text-blue-300 animate-pulse" /> WeatherWise
          </motion.h1>
          {(weather || lastWeather) && (
            <button 
              onClick={clearSearch}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
              title="Clear search"
            >
              <FiX className="text-white" />
            </button>
          )}
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="px-5 py-3 w-full rounded-full border-2 border-white border-opacity-50 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-transparent text-gray-800 placeholder-gray-500 bg-white bg-opacity-90 shadow-lg"
              onKeyPress={(e) => e.key === 'Enter' && searchWeather()}
            />
            {city && (
              <button
                onClick={() => setCity('')}
                className="absolute right-14 top-3 text-gray-500 hover:text-gray-700"
              >
                <FiX />
              </button>
            )}
          </div>
          <button
            onClick={searchWeather}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <FiSearch className="text-lg" /> 
            {loading ? (
              <span className="inline-flex">
                Searching<span className="animate-pulse">...</span>
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-500 bg-opacity-70 text-white rounded-xl backdrop-blur-sm flex items-center gap-3"
            >
              <FiAlertCircle className="flex-shrink-0" /> 
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(weather || lastWeather) && (
            <div className="space-y-8 mb-8">
              {/* Current Weather Section */}
              {weather && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >``
                 <h2 className="text-2xl font-bold text-black flex items-center gap-2 justify-center bg-blue-500/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 shadow-md">
  <FiCloud className="text-blue-300 text-xl animate-pulse" /> 
  <span className="text-black drop-shadow-md">Current Weather</span>
  
</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <WeatherCard 
                      icon={<FiThermometer className="text-red-400" />} 
                      title="Temperature" 
                      value={`${weather.temperature?.toFixed(1) ?? 'N/A'}°C`} 
                      subtitle={`Feels like ${weather.feels_like?.toFixed(1) ?? 'N/A'}°C`}
                      color="bg-gradient-to-br from-red-100 to-red-50"
                    />
                    <WeatherCard 
                      icon={<FiDroplet className="text-blue-400" />} 
                      title="Humidity" 
                      value={`${weather.humidity ?? 'N/A'}%`}
                      color="bg-gradient-to-br from-blue-100 to-blue-50"
                    />
                    <WeatherCard 
                      icon={<FiWind className="text-green-400" />} 
                      title="Wind" 
                      value={`${weather.wind_speed ?? 'N/A'} m/s`}
                      color="bg-gradient-to-br from-green-100 to-green-50"
                    />
                    <WeatherCard 
                      icon={<FiCloud className="text-indigo-400" />} 
                      title="Conditions" 
                      value={weather.weather ?? 'N/A'}
                      color="bg-gradient-to-br from-indigo-100 to-indigo-50"
                    />
                  </div>
                </motion.div>
              )}

              {/* Last Stored Weather Section */}
              {lastWeather && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-black flex items-center gap-2 justify-center bg-blue-500/20 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 shadow-md">
                    <FiDatabase className="text-blue-300 text-xl animate-pulse" /> Last Stored Weather
                    
                   
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <WeatherCard 
                      icon={<FiThermometer className="text-red-400" />} 
                      title="Temperature" 
                      value={`${lastWeather.temperature?.toFixed(1) ?? 'N/A'}°C`} 
                      subtitle={`Feels like ${lastWeather.feels_like?.toFixed(1) ?? 'N/A'}°C`}
                      color="bg-gradient-to-br from-purple-100 to-purple-50"
                    />
                    <WeatherCard 
                      icon={<FiDroplet className="text-blue-400" />} 
                      title="Humidity" 
                      value={`${lastWeather.humidity ?? 'N/A'}%`}
                      color="bg-gradient-to-br from-purple-100 to-purple-50"
                    />
                    <WeatherCard 
                      icon={<FiWind className="text-green-400" />} 
                      title="Wind" 
                      value={`${lastWeather.wind_speed ?? 'N/A'} m/s`}
                      color="bg-gradient-to-br from-purple-100 to-purple-50"
                    />
                    <WeatherCard 
                      icon={<FiCloud className="text-indigo-400" />} 
                      title="Conditions" 
                      value={lastWeather.weather ?? 'N/A'}
                      color="bg-gradient-to-br from-purple-100 to-purple-50"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
  {recommendations && (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md mb-8 border border-white border-opacity-30"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Do's Column */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">✓</span>
            Do's
          </h3>
          <ul className="space-y-2 text-gray-700">
            {recommendations.match(/\*\*Do's:\*\*([\s\S]*?)\*\*Don'ts:\*\*/)?.[1]
              .split('*').filter(item => item.trim())
              .map((item, index) => (
                <li key={`do-${index}`} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Don'ts Column */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">✗</span>
            Don'ts
          </h3>
          <ul className="space-y-2 text-gray-700">
            {recommendations.match(/\*\*Don'ts:\*\*([\s\S]*)/)?.[1]
              .split('*').filter(item => item.trim())
              .map((item, index) => (
                <li key={`dont-${index}`} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{item.trim()}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

        <AnimatePresence>
          {history.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md border border-white border-opacity-30"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiClock className="text-indigo-500" /> Search History
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <th className="py-3 px-4 text-left">Date & Time</th>
                      <th className="py-3 px-4 text-left">Temperature</th>
                      <th className="py-3 px-4 text-left">Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.map((record, index) => (
                      <tr 
                        key={index} 
                        className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          {new Date(record.search_time).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (record.weather_data?.temperature ?? 0) > 25 
                              ? 'bg-red-100 text-red-800' 
                              : (record.weather_data?.temperature ?? 0) < 10 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {record.weather_data?.temperature?.toFixed(1) ?? 'N/A'}°C
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {record.weather_data?.weather?.includes('cloud') && <FiCloud className="text-gray-500" />}
                            {record.weather_data?.weather?.includes('rain') && <FiDroplet className="text-blue-500" />}
                            {record.weather_data?.weather?.includes('sun') && <FiThermometer className="text-yellow-500" />}
                            {record.weather_data?.weather ?? 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const WeatherCard = ({ icon, title, value, subtitle, color = 'bg-white' }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className={`${color} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-50`}
  >
    <div className="flex items-center gap-3 mb-2 text-lg">
      <div className="p-2 rounded-full bg-white bg-opacity-80 shadow-sm">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </motion.div>
);

export default App;              
