// Modern Weather Widget using Fetch API and Geolocation
export class WeatherWidget {
  // Private fields
  #container = null;
  #defaultLocation = 'New York';
  #onLocationChange = null;
  #weatherData = null;
  #loading = false;
  #error = null;
  #abortController = null;

  // Weather API configuration (using a free service for demo)
  #apiConfig = {
    baseUrl: 'https://api.openweathermap.org/data/2.5/weather',
    // Note: In production, this would be in environment variables
    apiKey: 'demo_key', // This is a placeholder - real apps need API keys
    units: 'metric'
  };

  constructor(options = {}) {
    const { defaultLocation = 'New York', onLocationChange = null } = options;
    
    this.#defaultLocation = defaultLocation;
    this.#onLocationChange = onLocationChange;
  }

  async mount(container) {
    this.#container = container;
    await this.#render();
    this.#setupEventListeners();
    
    // Load weather data for default location
    await this.#loadWeatherData();
  }

  async #render() {
    const template = `
      <div class="weather-widget">
        <div class="weather-header">
          <div class="weather-controls">
            <button class="btn btn-secondary btn-small" data-action="refresh">
              🔄 Refresh
            </button>
            <button class="btn btn-secondary btn-small" data-action="location">
              📍 Use Location
            </button>
            <button class="btn btn-secondary btn-small" data-action="search">
              🔍 Search City
            </button>
          </div>
        </div>

        <div class="weather-display" id="weather-display">
          ${this.#getWeatherHTML()}
        </div>

        <div class="weather-info">
          <div class="data-container">
            <div class="data-item">
              <span class="data-label">Status:</span>
              <span class="data-value">${this.#getStatusText()}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Location:</span>
              <span class="data-value">${this.#getCurrentLocation()}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Last Updated:</span>
              <span class="data-value">${this.#getLastUpdated()}</span>
            </div>
          </div>
        </div>

        <!-- Search overlay (hidden by default) -->
        <div class="search-overlay" id="search-overlay" style="display: none;">
          <div class="search-modal">
            <h4>🔍 Search City</h4>
            <input type="text" id="city-input" placeholder="Enter city name..." />
            <div class="search-actions">
              <button class="btn" data-action="search-submit">Search</button>
              <button class="btn btn-secondary" data-action="search-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.#container.innerHTML = template;
  }

  #setupEventListeners() {
    this.#container.addEventListener('click', this.#handleClick.bind(this));
    
    // Handle Enter key in search input
    const cityInput = this.#container.querySelector('#city-input');
    cityInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.#handleSearchSubmit();
      }
    });
  }

  #handleClick = async (event) => {
    const action = event.target.getAttribute('data-action');
    if (!action) return;

    event.preventDefault();

    switch (action) {
      case 'refresh':
        await this.#loadWeatherData();
        break;
      case 'location':
        await this.#useCurrentLocation();
        break;
      case 'search':
        this.#showSearchModal();
        break;
      case 'search-submit':
        await this.#handleSearchSubmit();
        break;
      case 'search-cancel':
        this.#hideSearchModal();
        break;
    }
  };

  async #loadWeatherData(location = null) {
    const targetLocation = location || this.#defaultLocation;
    
    this.#setLoading(true);
    
    try {
      // Cancel any existing request
      if (this.#abortController) {
        this.#abortController.abort();
      }
      
      this.#abortController = new AbortController();
      
      // For demo purposes, we'll simulate weather data since we don't have a real API key
      const weatherData = await this.#simulateWeatherAPI(targetLocation);
      
      this.#weatherData = weatherData;
      this.#error = null;
      
      console.log('🌤️ Weather data loaded for:', targetLocation);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.#setError(error);
        console.error('❌ Failed to load weather data:', error);
      }
    } finally {
      this.#setLoading(false);
      await this.#updateDisplay();
    }
  }

  // Simulate weather API response for demo purposes
  async #simulateWeatherAPI(location) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simulate different weather conditions based on location
    const weatherConditions = [
      { main: 'Clear', description: 'clear sky', icon: '☀️' },
      { main: 'Clouds', description: 'few clouds', icon: '⛅' },
      { main: 'Clouds', description: 'scattered clouds', icon: '☁️' },
      { main: 'Rain', description: 'light rain', icon: '🌦️' },
      { main: 'Rain', description: 'moderate rain', icon: '🌧️' },
      { main: 'Snow', description: 'light snow', icon: '❄️' },
      { main: 'Mist', description: 'mist', icon: '🌫️' }
    ];
    
    const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const temp = Math.round(Math.random() * 30 + 5); // 5-35°C
    const humidity = Math.round(Math.random() * 40 + 30); // 30-70%
    const windSpeed = Math.round(Math.random() * 10 + 2); // 2-12 m/s
    
    return {
      location: {
        name: location,
        country: 'Demo'
      },
      weather: [condition],
      main: {
        temp,
        feels_like: temp + Math.round(Math.random() * 4 - 2),
        humidity,
        pressure: Math.round(Math.random() * 50 + 1000) // 1000-1050 hPa
      },
      wind: {
        speed: windSpeed,
        deg: Math.round(Math.random() * 360)
      },
      clouds: {
        all: Math.round(Math.random() * 100)
      },
      dt: Date.now() / 1000,
      sys: {
        sunrise: Date.now() / 1000 - 6 * 3600, // 6 hours ago
        sunset: Date.now() / 1000 + 6 * 3600   // 6 hours from now
      }
    };
  }

  async #useCurrentLocation() {
    if (!('geolocation' in navigator)) {
      this.#setError(new Error('Geolocation not supported'));
      return;
    }

    this.#setLoading(true);
    
    try {
      // Get current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      // For demo purposes, we'll reverse geocode to a city name
      const cityName = await this.#simulateReverseGeocode(latitude, longitude);
      
      // Load weather for the detected location
      await this.#loadWeatherData(cityName);
      
      this.#onLocationChange?.(cityName);
      
    } catch (error) {
      this.#setError(new Error(`Location error: ${error.message}`));
      this.#setLoading(false);
    }
  }

  async #simulateReverseGeocode(lat, lng) {
    // Simulate reverse geocoding delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a simulated city name based on coordinates
    const cities = ['New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Berlin', 'Toronto'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  #showSearchModal() {
    const overlay = this.#container.querySelector('#search-overlay');
    const input = this.#container.querySelector('#city-input');
    
    if (overlay) {
      overlay.style.display = 'flex';
      input?.focus();
    }
  }

  #hideSearchModal() {
    const overlay = this.#container.querySelector('#search-overlay');
    const input = this.#container.querySelector('#city-input');
    
    if (overlay) {
      overlay.style.display = 'none';
      input.value = '';
    }
  }

  async #handleSearchSubmit() {
    const input = this.#container.querySelector('#city-input');
    const city = input?.value?.trim();
    
    if (!city) {
      this.#setError(new Error('Please enter a city name'));
      return;
    }

    this.#hideSearchModal();
    await this.#loadWeatherData(city);
    this.#onLocationChange?.(city);
  }

  #getWeatherHTML() {
    if (this.#loading) {
      return `
        <div class="weather-loading">
          <div class="loading"></div>
          <div>Loading weather data...</div>
        </div>
      `;
    }

    if (this.#error) {
      return `
        <div class="weather-error">
          <div class="status error">❌ ${this.#error.message}</div>
        </div>
      `;
    }

    if (!this.#weatherData) {
      return `
        <div class="weather-placeholder">
          <div>🌤️ Click refresh to load weather data</div>
        </div>
      `;
    }

    const { location, weather, main, wind } = this.#weatherData;
    const condition = weather[0];

    return `
      <div class="weather-card">
        <div class="weather-main">
          <div class="weather-icon">${condition.icon}</div>
          <div class="weather-temp">${Math.round(main.temp)}°C</div>
          <div class="weather-location">${location.name}</div>
        </div>
        
        <div class="weather-condition">
          <div class="condition-main">${condition.main}</div>
          <div class="condition-desc">${condition.description}</div>
        </div>

        <div class="weather-details">
          <div class="detail-item">
            <span class="detail-icon">🌡️</span>
            <span class="detail-label">Feels like</span>
            <span class="detail-value">${Math.round(main.feels_like)}°C</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">💧</span>
            <span class="detail-label">Humidity</span>
            <span class="detail-value">${main.humidity}%</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🌬️</span>
            <span class="detail-label">Wind</span>
            <span class="detail-value">${wind.speed} m/s</span>
          </div>
          <div class="detail-item">
            <span class="detail-icon">🔽</span>
            <span class="detail-label">Pressure</span>
            <span class="detail-value">${main.pressure} hPa</span>
          </div>
        </div>
      </div>
    `;
  }

  #getStatusText() {
    if (this.#loading) return 'Loading...';
    if (this.#error) return 'Error';
    if (this.#weatherData) return 'Loaded';
    return 'Ready';
  }

  #getCurrentLocation() {
    return this.#weatherData?.location?.name || this.#defaultLocation;
  }

  #getLastUpdated() {
    if (!this.#weatherData) return 'Never';
    
    const lastUpdate = new Date(this.#weatherData.dt * 1000);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastUpdate) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return lastUpdate.toLocaleDateString();
  }

  async #updateDisplay() {
    if (!this.#container) return;
    
    const weatherDisplay = this.#container.querySelector('#weather-display');
    if (weatherDisplay) {
      weatherDisplay.innerHTML = this.#getWeatherHTML();
    }

    // Re-render the entire widget to update info section
    await this.#render();
    this.#setupEventListeners();
  }

  #setLoading(loading) {
    this.#loading = loading;
    if (loading) {
      this.#error = null;
    }
  }

  #setError(error) {
    this.#error = error;
    this.#loading = false;
  }

  // Public API methods
  async refresh() {
    await this.#loadWeatherData();
  }

  async setLocation(location) {
    await this.#loadWeatherData(location);
    this.#onLocationChange?.(location);
  }

  getWeatherData() {
    return this.#weatherData ? { ...this.#weatherData } : null;
  }

  // Cleanup
  destroy() {
    if (this.#abortController) {
      this.#abortController.abort();
    }

    if (this.#container) {
      this.#container.innerHTML = '';
      this.#container = null;
    }

    this.#onLocationChange = null;
  }
}