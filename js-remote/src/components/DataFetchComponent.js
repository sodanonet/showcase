// Modern JavaScript Data Fetching Component with Async/Await
export class DataFetchComponent {
  // Private fields
  #apiUrl = null;
  #container = null;
  #onDataLoad = null;
  #cache = new Map();
  #abortController = null;
  #data = [];
  #loading = false;
  #error = null;

  constructor(options = {}) {
    const { apiUrl, onDataLoad = null, cacheTTL = 300000 } = options;
    
    this.#apiUrl = apiUrl;
    this.#onDataLoad = onDataLoad;
    this.cacheTTL = cacheTTL; // 5 minutes default
  }

  async mount(container) {
    this.#container = container;
    await this.#render();
    this.#setupEventListeners();
    
    // Auto-load data on mount
    await this.#fetchData();
  }

  async #render() {
    const template = `
      <div class="data-fetch-container">
        <div class="data-fetch-header">
          <div class="data-fetch-controls">
            <button class="btn btn-secondary btn-small" data-action="fetch">
              🔄 Fetch Data
            </button>
            <button class="btn btn-secondary btn-small" data-action="clear">
              🗑️ Clear Cache
            </button>
            <button class="btn btn-secondary btn-small" data-action="cancel">
              ⏹️ Cancel
            </button>
          </div>
        </div>

        <div id="fetch-status" class="fetch-status">
          ${this.#getStatusHTML()}
        </div>

        <div id="data-display" class="data-display">
          ${await this.#getDataHTML()}
        </div>

        <div class="fetch-info">
          <div class="data-container">
            <div class="data-item">
              <span class="data-label">API URL:</span>
              <span class="data-value" style="font-family: monospace; font-size: 0.8rem;">
                ${this.#apiUrl || 'Not set'}
              </span>
            </div>
            <div class="data-item">
              <span class="data-label">Cache Size:</span>
              <span class="data-value">${this.#cache.size} entries</span>
            </div>
            <div class="data-item">
              <span class="data-label">Data Count:</span>
              <span class="data-value">${this.#data.length} items</span>
            </div>
            <div class="data-item">
              <span class="data-label">Status:</span>
              <span class="data-value">${this.#getStatusText()}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.#container.innerHTML = template;
  }

  #setupEventListeners() {
    this.#container.addEventListener('click', this.#handleClick.bind(this));
  }

  #handleClick = async (event) => {
    const action = event.target.getAttribute('data-action');
    if (!action) return;

    event.preventDefault();

    switch (action) {
      case 'fetch':
        await this.#fetchData();
        break;
      case 'clear':
        this.#clearCache();
        break;
      case 'cancel':
        this.#cancelRequest();
        break;
      default:
        // Handle data item clicks for details
        if (action.startsWith('show-details-')) {
          const index = parseInt(action.replace('show-details-', ''), 10);
          this.#showItemDetails(index);
        }
    }
  };

  // Modern async/await data fetching with error handling
  async #fetchData() {
    if (!this.#apiUrl) {
      this.#setError(new Error('No API URL configured'));
      return;
    }

    // Check cache first
    const cached = this.#getFromCache(this.#apiUrl);
    if (cached) {
      console.log('📦 Using cached data');
      this.#data = cached;
      await this.#updateDisplay();
      this.#onDataLoad?.(this.#data);
      return;
    }

    this.#setLoading(true);
    
    try {
      // Create new abort controller for this request
      this.#abortController = new AbortController();
      
      console.log('🌐 Fetching data from:', this.#apiUrl);
      
      // Using modern fetch with abort signal
      const response = await fetch(this.#apiUrl, {
        signal: this.#abortController.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();
      
      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error('Expected array response from API');
      }

      // Process and store data
      this.#data = this.#processData(data);
      
      // Cache the data with timestamp
      this.#setCache(this.#apiUrl, this.#data);
      
      // Update display
      await this.#updateDisplay();
      
      // Call callback
      this.#onDataLoad?.(this.#data);
      
      console.log('✅ Data fetched successfully:', this.#data.length, 'items');
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🛑 Request was cancelled');
        this.#setError(new Error('Request was cancelled'));
      } else {
        console.error('❌ Failed to fetch data:', error);
        this.#setError(error);
      }
    } finally {
      this.#setLoading(false);
    }
  }

  // Process raw API data using modern JavaScript features
  #processData(rawData) {
    return rawData
      .map((item, index) => ({
        id: item.id ?? index,
        name: item.name ?? 'Unknown',
        email: item.email ?? 'No email',
        phone: item.phone ?? 'No phone',
        website: item.website ?? 'No website',
        company: item.company?.name ?? 'No company',
        address: this.#formatAddress(item.address),
        // Using optional chaining and nullish coalescing
        username: item.username ?? 'anonymous',
        // Transform nested objects
        ...this.#extractMetadata(item)
      }))
      .filter(item => item.name !== 'Unknown') // Filter invalid entries
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }

  #formatAddress(address) {
    if (!address) return 'No address';
    
    // Using destructuring with defaults
    const { 
      street = '', 
      suite = '', 
      city = '', 
      zipcode = '' 
    } = address;
    
    return [street, suite, city, zipcode]
      .filter(Boolean) // Remove empty strings
      .join(', ') || 'Incomplete address';
  }

  #extractMetadata(item) {
    return {
      hasWebsite: Boolean(item.website),
      domainExtension: item.email ? item.email.split('@')[1] : null,
      phoneFormatted: this.#formatPhone(item.phone),
      initials: this.#getInitials(item.name)
    };
  }

  #formatPhone(phone) {
    if (!phone) return null;
    
    // Simple phone formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return phone;
  }

  #getInitials(name) {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() ?? '??';
  }

  // Cache management with TTL
  #getFromCache(key) {
    const cached = this.#cache.get(key);
    if (!cached) return null;
    
    const { data, timestamp } = cached;
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp > this.cacheTTL) {
      this.#cache.delete(key);
      return null;
    }
    
    return data;
  }

  #setCache(key, data) {
    this.#cache.set(key, {
      data: [...data], // Create a copy
      timestamp: Date.now()
    });
  }

  #clearCache() {
    this.#cache.clear();
    console.log('🗑️ Cache cleared');
    this.#updateDisplay();
  }

  #cancelRequest() {
    if (this.#abortController) {
      this.#abortController.abort();
      console.log('🛑 Request cancelled');
    }
  }

  // State management methods
  #setLoading(loading) {
    this.#loading = loading;
    if (loading) {
      this.#error = null;
    }
    this.#updateStatusDisplay();
  }

  #setError(error) {
    this.#error = error;
    this.#loading = false;
    this.#updateStatusDisplay();
  }

  // Display update methods
  async #updateDisplay() {
    if (!this.#container) return;
    
    const statusElement = this.#container.querySelector('#fetch-status');
    const dataElement = this.#container.querySelector('#data-display');
    
    if (statusElement) {
      statusElement.innerHTML = this.#getStatusHTML();
    }
    
    if (dataElement) {
      dataElement.innerHTML = await this.#getDataHTML();
    }
  }

  #updateStatusDisplay() {
    const statusElement = this.#container?.querySelector('#fetch-status');
    if (statusElement) {
      statusElement.innerHTML = this.#getStatusHTML();
    }
  }

  #getStatusHTML() {
    if (this.#loading) {
      return '<div class="status info"><span class="loading"></span> Fetching data...</div>';
    }
    
    if (this.#error) {
      return `<div class="status error">❌ ${this.#error.message}</div>`;
    }
    
    if (this.#data.length > 0) {
      return '<div class="status success">✅ Data loaded successfully</div>';
    }
    
    return '<div class="status info">📡 Ready to fetch data</div>';
  }

  #getStatusText() {
    if (this.#loading) return 'Loading...';
    if (this.#error) return 'Error';
    if (this.#data.length > 0) return 'Loaded';
    return 'Ready';
  }

  async #getDataHTML() {
    if (this.#data.length === 0) {
      return '<div class="no-data">No data available. Click "Fetch Data" to load.</div>';
    }

    // Using modern array methods with template literals
    const dataHTML = this.#data
      .slice(0, 5) // Limit display to first 5 items
      .map((item, index) => `
        <div class="data-item-card" onclick="window.jsDataFetch?.showDetails(${index})">
          <div class="data-item-header">
            <div class="data-item-avatar">${item.initials}</div>
            <div class="data-item-info">
              <div class="data-item-name">${item.name}</div>
              <div class="data-item-email">${item.email}</div>
            </div>
          </div>
          <div class="data-item-details">
            <div class="data-detail">
              <span class="data-label">Company:</span>
              <span class="data-value">${item.company}</span>
            </div>
            <div class="data-detail">
              <span class="data-label">Phone:</span>
              <span class="data-value">${item.phoneFormatted || item.phone}</span>
            </div>
            ${item.website ? `
              <div class="data-detail">
                <span class="data-label">Website:</span>
                <span class="data-value">${item.website}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('');

    const moreCount = Math.max(0, this.#data.length - 5);
    const moreHTML = moreCount > 0 ? `
      <div class="data-more">
        <div class="status info">+ ${moreCount} more items</div>
      </div>
    ` : '';

    // Expose method globally for onclick handlers
    window.jsDataFetch = {
      showDetails: (index) => this.#showItemDetails(index)
    };

    return `
      <div class="data-list">
        ${dataHTML}
        ${moreHTML}
      </div>
    `;
  }

  #showItemDetails(index) {
    const item = this.#data[index];
    if (!item) return;

    // Create a modal-like display for item details
    const detailsHTML = `
      <div class="item-details-overlay" onclick="this.remove()">
        <div class="item-details-modal" onclick="event.stopPropagation()">
          <h3>📋 ${item.name}</h3>
          <div class="data-container">
            ${Object.entries(item)
              .filter(([key, value]) => value && !key.startsWith('_'))
              .map(([key, value]) => `
                <div class="data-item">
                  <span class="data-label">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span class="data-value">${value}</span>
                </div>
              `).join('')}
          </div>
          <button class="btn" onclick="this.parentElement.parentElement.remove()">
            ✖️ Close
          </button>
        </div>
      </div>
    `;

    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
      .item-details-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeInUp 0.3s ease;
      }
      .item-details-modal {
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        color: #333;
      }
      .item-details-modal h3 {
        margin: 0 0 20px 0;
        color: #333;
      }
    `;

    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', detailsHTML);

    // Clean up style when modal is closed
    setTimeout(() => {
      const overlay = document.querySelector('.item-details-overlay');
      if (overlay) {
        overlay.addEventListener('remove', () => {
          style.remove();
        });
      }
    }, 100);
  }

  // Public API methods
  async refetch() {
    await this.#fetchData();
  }

  getData() {
    return [...this.#data]; // Return a copy
  }

  setApiUrl(url) {
    this.#apiUrl = url;
    this.#data = [];
    this.#error = null;
    this.#updateDisplay();
  }

  // Cleanup
  destroy() {
    this.#cancelRequest();
    this.#cache.clear();
    
    if (this.#container) {
      this.#container.innerHTML = '';
      this.#container = null;
    }

    // Clean up global reference
    delete window.jsDataFetch;
  }
}