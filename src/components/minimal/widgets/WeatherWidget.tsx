import { memo, useEffect, useState, useCallback } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Zap, MapPin, RefreshCw } from "lucide-react";
import { useHalo } from "../../../state/HaloStateContext";
import type { WeatherData } from "../../../types/halo";

const CACHE_TTL = 10 * 60 * 1000;
const WMO_CODES: Record<number, { label: string; icon: React.ReactNode }> = {
  0: { label: "Clear", icon: <Sun size={28} /> }, 1: { label: "Mainly clear", icon: <Sun size={28} /> },
  2: { label: "Partly cloudy", icon: <Cloud size={28} /> }, 3: { label: "Overcast", icon: <Cloud size={28} /> },
  51: { label: "Drizzle", icon: <CloudRain size={28} /> }, 61: { label: "Rain", icon: <CloudRain size={28} /> },
  71: { label: "Snow", icon: <CloudSnow size={28} /> }, 95: { label: "Thunderstorm", icon: <Zap size={28} /> },
};

function getWeatherInfo(code: number) {
  return WMO_CODES[code] ?? { label: "Unknown", icon: <Cloud size={28} /> };
}

export default memo(function WeatherWidget() {
  const { state, dispatch } = useHalo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [city, setCity] = useState(state.weatherCity || "");
  const [editing, setEditing] = useState(!state.weatherCity);

  const fetchWeather = useCallback(async (cityName: string) => {
    setLoading(true);
    setError("");
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("City not found");
      const { latitude, longitude, name } = geoData.results[0];

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const weatherData = await weatherRes.json();
      const cw = weatherData.current_weather;
      const info = getWeatherInfo(cw.weathercode);

      const data: WeatherData = { temp: Math.round(cw.temperature), condition: info.label, icon: String(cw.weathercode), city: name, fetchedAt: Date.now() };
      dispatch({ type: "SET_WEATHER", payload: data });
      dispatch({ type: "SET_WEATHER_CITY", payload: cityName });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch weather");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const d = state.weatherData;
    if (state.weatherCity && (!d || Date.now() - d.fetchedAt > CACHE_TTL)) {
      fetchWeather(state.weatherCity);
    }
  }, []);

  if (editing || !state.weatherCity) {
    return (
      <div className="widget-weather">
        <div className="widget-section-title">Weather</div>
        <div className="widget-weather__setup">
          <MapPin size={14} />
          <input className="widget-input" placeholder="Enter city..." value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && city.trim()) { fetchWeather(city.trim()); setEditing(false); } }} autoFocus />
          <button className="widget-btn-primary" onClick={() => { if (city.trim()) { fetchWeather(city.trim()); setEditing(false); } }}>Set</button>
        </div>
        {error && <div className="widget-error">{error}</div>}
      </div>
    );
  }

  const d = state.weatherData;
  const info = d ? getWeatherInfo(Number(d.icon)) : null;

  return (
    <div className="widget-weather">
      {loading ? (
        <div className="widget-weather__loading"><RefreshCw size={18} className="spin" /><span>Fetching...</span></div>
      ) : d ? (
        <div className="widget-weather__content">
          <div className="widget-weather__icon">{info?.icon}</div>
          <div className="widget-weather__info">
            <div className="widget-weather__temp">{d.temp}°C</div>
            <div className="widget-weather__condition">{d.condition}</div>
            <div className="widget-weather__city"><MapPin size={11} />{d.city}</div>
          </div>
          <button className="widget-weather__refresh" onClick={() => fetchWeather(state.weatherCity)} title="Refresh"><RefreshCw size={12} /></button>
        </div>
      ) : null}
      {error && <div className="widget-error">{error}</div>}
      <button className="widget-weather__change" onClick={() => setEditing(true)}>Change city</button>
    </div>
  );
});
