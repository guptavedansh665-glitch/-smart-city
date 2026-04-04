const GEO_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

const WeatherService = {
    async getWeatherData(city) {
        try {
            // 1. Get Coordinates
            const geoResponse = await fetch(`${GEO_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found");
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // 2. Get Weather Data
            const weatherResponse = await fetch(
                `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`
            );
            const weatherData = await weatherResponse.json();

            return this.formatData(weatherData, name, country);
        } catch (error) {
            console.error("WeatherService Error:", error);
            throw error;
        }
    },

    formatData(data, cityName, country) {
        const current = data.current;
        const daily = data.daily;

        return {
            location: `${cityName}, ${country}`,
            current: {
                temp: Math.round(current.temperature_2m),
                feelsLike: Math.round(current.apparent_temperature),
                humidity: current.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                condition: this.getCondition(current.weather_code),
                icon: this.getIcon(current.weather_code, current.is_day),
                high: Math.round(daily.temperature_2m_max[0]),
                low: Math.round(daily.temperature_2m_min[0]),
                uvIndex: daily.uv_index_max[0]
            },
            forecast: daily.time.map((date, index) => ({
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                tempMax: Math.round(daily.temperature_2m_max[index]),
                tempMin: Math.round(daily.temperature_2m_min[index]),
                icon: this.getIcon(daily.weather_code[index], 1) // Always show day icon for forecast
            }))
        };
    },

    getCondition(code) {
        const conditions = {
            0: "Clear Sky",
            1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
            45: "Foggy", 48: "Depositing Rime Fog",
            51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
            61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
            71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
            80: "Slight Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers",
            95: "Thunderstorm"
        };
        return conditions[code] || "Unknown";
    },

    getIcon(code, isDay) {
        // Mapping codes to weather icons (using OpenWeatherMap icons for simplicity, or local SVG paths)
        // For now, I'll use a reliable CDN for icons
        const iconMap = {
            0: isDay ? "01d" : "01n",
            1: isDay ? "02d" : "02n",
            2: isDay ? "03d" : "03n",
            3: isDay ? "04d" : "04n",
            45: "50d",
            51: "09d",
            61: "10d",
            71: "13d",
            80: "09d",
            95: "11d"
        };
        const iconCode = iconMap[code] || (code > 0 && code < 4 ? "02d" : "01d");
        return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    }
};
