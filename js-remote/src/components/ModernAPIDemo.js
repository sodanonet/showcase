// Modern Browser APIs Demonstration Component
export class ModernAPIDemo {
  // Private fields
  #container = null;
  #onFeatureTest = null;
  #notificationPermission = 'default';
  #geolocationData = null;
  #isOnline = navigator.onLine;

  // Modern JavaScript: Map to store API test results
  #apiResults = new Map();

  constructor(options = {}) {
    const { onFeatureTest = null } = options;
    this.#onFeatureTest = onFeatureTest;
    
    // Initialize online/offline detection
    this.#setupNetworkListeners();
  }

  async mount(container) {
    this.#container = container;
    await this.#checkInitialState();
    await this.#render();
    this.#setupEventListeners();
  }

  async #checkInitialState() {
    // Check notification permission
    if ('Notification' in window) {
      this.#notificationPermission = Notification.permission;
    }

    // Check network status
    this.#isOnline = navigator.onLine;
  }

  async #render() {
    const apis = this.#getAPIList();
    
    const template = `
      <div class="api-demo-container">
        <div class="api-grid">
          ${apis.map(api => this.#renderAPICard(api)).join('')}
        </div>
        
        <div class="api-results" id="api-results">
          ${this.#renderResults()}
        </div>
      </div>
    `;

    this.#container.innerHTML = template;
  }

  #getAPIList() {
    return [
      {
        id: 'geolocation',
        name: 'Geolocation',
        icon: '📍',
        description: 'Get current location',
        supported: 'geolocation' in navigator,
        action: 'test-geolocation'
      },
      {
        id: 'notification',
        name: 'Notifications',
        icon: '🔔',
        description: 'Show browser notifications',
        supported: 'Notification' in window,
        action: 'test-notification'
      },
      {
        id: 'clipboard',
        name: 'Clipboard',
        icon: '📋',
        description: 'Read/write clipboard',
        supported: 'clipboard' in navigator,
        action: 'test-clipboard'
      },
      {
        id: 'battery',
        name: 'Battery Status',
        icon: '🔋',
        description: 'Battery information',
        supported: 'getBattery' in navigator,
        action: 'test-battery'
      },
      {
        id: 'vibration',
        name: 'Vibration',
        icon: '📳',
        description: 'Device vibration',
        supported: 'vibrate' in navigator,
        action: 'test-vibration'
      },
      {
        id: 'share',
        name: 'Web Share',
        icon: '📤',
        description: 'Native sharing',
        supported: 'share' in navigator,
        action: 'test-share'
      },
      {
        id: 'wakeLock',
        name: 'Wake Lock',
        icon: '🔒',
        description: 'Prevent sleep',
        supported: 'wakeLock' in navigator,
        action: 'test-wakelock'
      },
      {
        id: 'fullscreen',
        name: 'Fullscreen',
        icon: '⛶',
        description: 'Toggle fullscreen',
        supported: 'requestFullscreen' in document.documentElement,
        action: 'test-fullscreen'
      }
    ];
  }

  #renderAPICard(api) {
    const result = this.#apiResults.get(api.id);
    const statusClass = api.supported ? 'supported' : 'not-supported';
    
    return `
      <div class="api-item ${statusClass}" data-action="${api.action}">
        <div class="api-icon">${api.icon}</div>
        <div class="api-name">${api.name}</div>
        <div class="api-description">${api.description}</div>
        <div class="api-status ${statusClass}">
          ${api.supported ? '✅ Supported' : '❌ Not Supported'}
        </div>
        ${result ? `
          <div class="api-result">
            <small>${result}</small>
          </div>
        ` : ''}
      </div>
    `;
  }

  #renderResults() {
    if (this.#apiResults.size === 0) {
      return '<div class="no-results">Click on any API card to test it</div>';
    }

    const resultsHTML = Array.from(this.#apiResults.entries())
      .map(([apiId, result]) => `
        <div class="result-item">
          <strong>${apiId}:</strong> ${result}
        </div>
      `).join('');

    return `
      <div class="results-container">
        <h4>🧪 Test Results</h4>
        ${resultsHTML}
      </div>
    `;
  }

  #setupEventListeners() {
    this.#container.addEventListener('click', this.#handleClick.bind(this));
  }

  #setupNetworkListeners() {
    // Modern event listeners for network status
    window.addEventListener('online', () => {
      this.#isOnline = true;
      this.#updateNetworkStatus();
    });

    window.addEventListener('offline', () => {
      this.#isOnline = false;
      this.#updateNetworkStatus();
    });
  }

  #updateNetworkStatus() {
    console.log(`🌐 Network status: ${this.#isOnline ? 'Online' : 'Offline'}`);
    this.#setResult('network', `Status: ${this.#isOnline ? 'Online' : 'Offline'}`);
  }

  #handleClick = async (event) => {
    const action = event.target.closest('[data-action]')?.getAttribute('data-action');
    if (!action) return;

    event.preventDefault();
    
    // Using modern switch with await
    switch (action) {
      case 'test-geolocation':
        await this.#testGeolocation();
        break;
      case 'test-notification':
        await this.#testNotification();
        break;
      case 'test-clipboard':
        await this.#testClipboard();
        break;
      case 'test-battery':
        await this.#testBattery();
        break;
      case 'test-vibration':
        await this.#testVibration();
        break;
      case 'test-share':
        await this.#testShare();
        break;
      case 'test-wakelock':
        await this.#testWakeLock();
        break;
      case 'test-fullscreen':
        await this.#testFullscreen();
        break;
    }
  };

  // API Test Methods using modern async/await patterns

  async #testGeolocation() {
    if (!('geolocation' in navigator)) {
      this.#setResult('geolocation', 'Not supported');
      return;
    }

    try {
      this.#setResult('geolocation', 'Getting location...');
      
      // Using Promise wrapper for callback-based API
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude, accuracy } = position.coords;
      this.#geolocationData = { latitude, longitude, accuracy };
      
      this.#setResult('geolocation', 
        `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
      );
      
      this.#onFeatureTest?.('geolocation', this.#geolocationData);
      
    } catch (error) {
      this.#setResult('geolocation', `Error: ${error.message}`);
    }
  }

  async #testNotification() {
    if (!('Notification' in window)) {
      this.#setResult('notification', 'Not supported');
      return;
    }

    try {
      // Request permission using modern approach
      const permission = await Notification.requestPermission();
      this.#notificationPermission = permission;
      
      if (permission === 'granted') {
        // Create notification with modern options
        const notification = new Notification('JavaScript Remote Test', {
          body: 'This notification was created by the Modern API Demo!',
          icon: '/favicon.ico',
          tag: 'js-remote-test',
          timestamp: Date.now(),
          actions: [
            { action: 'view', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        });

        notification.onclick = () => {
          console.log('Notification clicked');
          notification.close();
        };

        setTimeout(() => notification.close(), 5000);
        
        this.#setResult('notification', 'Notification sent successfully');
      } else {
        this.#setResult('notification', `Permission: ${permission}`);
      }
      
      this.#onFeatureTest?.('notification', { permission });
      
    } catch (error) {
      this.#setResult('notification', `Error: ${error.message}`);
    }
  }

  async #testClipboard() {
    if (!('clipboard' in navigator)) {
      this.#setResult('clipboard', 'Not supported');
      return;
    }

    try {
      const testText = `JavaScript Remote - ${new Date().toISOString()}`;
      
      // Write to clipboard
      await navigator.clipboard.writeText(testText);
      
      // Read from clipboard to verify
      const clipboardText = await navigator.clipboard.readText();
      
      this.#setResult('clipboard', 
        clipboardText === testText ? 'Write/Read successful' : 'Verification failed'
      );
      
      this.#onFeatureTest?.('clipboard', { success: true, text: testText });
      
    } catch (error) {
      this.#setResult('clipboard', `Error: ${error.message}`);
    }
  }

  async #testBattery() {
    if (!('getBattery' in navigator)) {
      this.#setResult('battery', 'Not supported');
      return;
    }

    try {
      // Using modern battery API
      const battery = await navigator.getBattery();
      
      const batteryInfo = {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };

      this.#setResult('battery', 
        `${batteryInfo.level}% ${batteryInfo.charging ? '🔌' : '🔋'}`
      );
      
      // Listen for battery events
      battery.addEventListener('chargingchange', () => {
        this.#setResult('battery', 
          `${Math.round(battery.level * 100)}% ${battery.charging ? '🔌' : '🔋'}`
        );
      });
      
      this.#onFeatureTest?.('battery', batteryInfo);
      
    } catch (error) {
      this.#setResult('battery', `Error: ${error.message}`);
    }
  }

  async #testVibration() {
    if (!('vibrate' in navigator)) {
      this.#setResult('vibration', 'Not supported');
      return;
    }

    try {
      // Vibration pattern: short-pause-long-pause-short
      const pattern = [100, 100, 200, 100, 100];
      const success = navigator.vibrate(pattern);
      
      this.#setResult('vibration', 
        success ? 'Vibration triggered' : 'Vibration failed'
      );
      
      this.#onFeatureTest?.('vibration', { success, pattern });
      
    } catch (error) {
      this.#setResult('vibration', `Error: ${error.message}`);
    }
  }

  async #testShare() {
    if (!('share' in navigator)) {
      this.#setResult('share', 'Not supported');
      return;
    }

    try {
      const shareData = {
        title: 'JavaScript Remote Demo',
        text: 'Check out this modern JavaScript micro-frontend!',
        url: window.location.href
      };

      // Check if sharing is supported for this data
      if (navigator.canShare && !navigator.canShare(shareData)) {
        this.#setResult('share', 'Share data not supported');
        return;
      }

      await navigator.share(shareData);
      this.#setResult('share', 'Share dialog opened');
      
      this.#onFeatureTest?.('share', shareData);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        this.#setResult('share', 'Share cancelled');
      } else {
        this.#setResult('share', `Error: ${error.message}`);
      }
    }
  }

  async #testWakeLock() {
    if (!('wakeLock' in navigator)) {
      this.#setResult('wakeLock', 'Not supported');
      return;
    }

    try {
      // Request wake lock
      const wakeLock = await navigator.wakeLock.request('screen');
      
      wakeLock.addEventListener('release', () => {
        this.#setResult('wakeLock', 'Wake lock released');
      });

      this.#setResult('wakeLock', 'Wake lock active');
      
      // Auto-release after 5 seconds for demo
      setTimeout(() => {
        wakeLock.release();
      }, 5000);
      
      this.#onFeatureTest?.('wakeLock', { type: 'screen' });
      
    } catch (error) {
      this.#setResult('wakeLock', `Error: ${error.message}`);
    }
  }

  async #testFullscreen() {
    if (!('requestFullscreen' in document.documentElement)) {
      this.#setResult('fullscreen', 'Not supported');
      return;
    }

    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        await document.documentElement.requestFullscreen();
        this.#setResult('fullscreen', 'Entered fullscreen');
        
        // Auto-exit after 3 seconds for demo
        setTimeout(async () => {
          if (document.fullscreenElement) {
            await document.exitFullscreen();
            this.#setResult('fullscreen', 'Exited fullscreen');
          }
        }, 3000);
        
      } else {
        // Exit fullscreen
        await document.exitFullscreen();
        this.#setResult('fullscreen', 'Exited fullscreen');
      }
      
      this.#onFeatureTest?.('fullscreen', { 
        action: document.fullscreenElement ? 'enter' : 'exit' 
      });
      
    } catch (error) {
      this.#setResult('fullscreen', `Error: ${error.message}`);
    }
  }

  // Helper methods

  #setResult(apiId, result) {
    this.#apiResults.set(apiId, result);
    this.#updateResultsDisplay();
  }

  #updateResultsDisplay() {
    const resultsContainer = this.#container?.querySelector('#api-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = this.#renderResults();
    }
  }

  // Public methods

  getResults() {
    return new Map(this.#apiResults);
  }

  clearResults() {
    this.#apiResults.clear();
    this.#updateResultsDisplay();
  }

  // Cleanup
  destroy() {
    // Remove network listeners
    window.removeEventListener('online', this.#updateNetworkStatus);
    window.removeEventListener('offline', this.#updateNetworkStatus);
    
    if (this.#container) {
      this.#container.innerHTML = '';
      this.#container = null;
    }

    this.#onFeatureTest = null;
    this.#apiResults.clear();
  }
}