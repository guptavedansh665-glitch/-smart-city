// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const welcomeMessage = document.getElementById('welcome-message');

// UI Update Elements
const cityNameEl = document.getElementById('city-name');
const currentTempEl = document.getElementById('current-temp');
const weatherConditionEl = document.getElementById('weather-condition');
const tempRangeEl = document.getElementById('temp-range');
const weatherIconEl = document.getElementById('weather-icon');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');
const feelsLikeEl = document.getElementById('feels-like');
const uvIndexEl = document.getElementById('uv-index');
const forecastContainer = document.getElementById('forecast-container');

// Event Listeners
searchBtn.addEventListener('click', () => handleSearch());
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;

    showState('loading');

    try {
        const data = await WeatherService.getWeatherData(city);
        updateUI(data);
        showState('display');
    } catch (error) {
        showState('error');
    }
}

function updateUI(data) {
    // Current Weather
    cityNameEl.textContent = data.location;
    currentTempEl.textContent = `${data.current.temp}°`;
    weatherConditionEl.textContent = data.current.condition;
    tempRangeEl.textContent = `H: ${data.current.high}° L: ${data.current.low}°`;
    weatherIconEl.src = data.current.icon;
    weatherIconEl.alt = data.current.condition;

    // Details
    humidityEl.textContent = `${data.current.humidity}%`;
    windSpeedEl.textContent = `${data.current.windSpeed} km/h`;
    feelsLikeEl.textContent = `${data.current.feelsLike}°`;
    uvIndexEl.textContent = data.current.uvIndex;

    // Forecast
    forecastContainer.innerHTML = '';
    data.forecast.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <span class="day">${day.date}</span>
            <img src="${day.icon}" alt="Forecast Icon">
            <span class="temp-range">${day.tempMax}° / ${day.tempMin}°</span>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

function showState(state) {
    welcomeMessage.classList.add('hidden');
    loader.classList.add('hidden');
    errorMessage.classList.add('hidden');
    weatherDisplay.classList.add('hidden');

    if (state === 'loading') {
        loader.classList.remove('hidden');
    } else if (state === 'error') {
        errorMessage.classList.remove('hidden');
    } else if (state === 'display') {
        weatherDisplay.classList.remove('hidden');
    }
}

// Optional: Initialize with a default city or geolocation
// handleSearch('London');
