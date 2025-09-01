import { BaseWebComponent } from '../base/BaseWebComponent';
import { Component, ObservedAttributes } from '../decorators/Component';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface NetworkInfo {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

interface StorageInfo {
  localStorage: { used: number; available: number };
  sessionStorage: { used: number; available: number };
}

interface DeviceInfo {
  userAgent: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  onLine: boolean;
  hardwareConcurrency: number;
  maxTouchPoints: number;
}

interface WebAPIState {
  geolocation: GeolocationData | null;
  network: NetworkInfo;
  storage: StorageInfo;
  device: DeviceInfo;
  notifications: boolean;
  camera: boolean;
  microphone: boolean;
  clipboard: string;
  battery: BatteryManager | null;
  wakeLock: WakeLockSentinel | null;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

@Component('ts-web-api-demo')
export class WebAPIDemo extends BaseWebComponent {
  private state: WebAPIState = {
    geolocation: null,
    network: {
      online: navigator.onLine
    },
    storage: {
      localStorage: { used: 0, available: 0 },
      sessionStorage: { used: 0, available: 0 }
    },
    device: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages as string[],
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints
    },
    notifications: false,
    camera: false,
    microphone: false,
    clipboard: '',
    battery: null,
    wakeLock: null
  };

  private updateInterval: number | null = null;
  private watchId: number | null = null;

  static get observedAttributes(): string[] {
    return ['auto-update', 'demo-mode'];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initializeAPIs();
    this.setupAutoUpdate();
  }

  private async initializeAPIs(): Promise<void> {
    await this.checkPermissions();
    this.updateStorageInfo();
    this.updateNetworkInfo();
    await this.getBatteryInfo();
    this.render();
  }

  private async checkPermissions(): Promise<void> {
    try {
      // Check Notifications permission
      if ('Notification' in window) {
        this.state.notifications = Notification.permission === 'granted';
      }

      // Check Camera permission
      if ('permissions' in navigator) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        this.state.camera = cameraPermission.state === 'granted';
        
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        this.state.microphone = microphonePermission.state === 'granted';
      }
    } catch (error) {
      console.log('Some permissions could not be checked:', error);
    }
  }

  private updateStorageInfo(): void {
    // Calculate localStorage usage
    let localStorageUsed = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageUsed += localStorage[key].length + key.length;
      }
    }

    // Calculate sessionStorage usage
    let sessionStorageUsed = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        sessionStorageUsed += sessionStorage[key].length + key.length;
      }
    }

    this.state.storage = {
      localStorage: {
        used: localStorageUsed,
        available: 10 * 1024 * 1024 - localStorageUsed // Approximate 10MB limit
      },
      sessionStorage: {
        used: sessionStorageUsed,
        available: 10 * 1024 * 1024 - sessionStorageUsed
      }
    };
  }

  private updateNetworkInfo(): void {
    this.state.network.online = navigator.onLine;
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.state.network.effectiveType = connection?.effectiveType;
      this.state.network.downlink = connection?.downlink;
      this.state.network.rtt = connection?.rtt;
    }
  }

  private async getBatteryInfo(): Promise<void> {
    try {
      if ('getBattery' in navigator) {
        this.state.battery = await (navigator as any).getBattery();
      }
    } catch (error) {
      console.log('Battery API not available:', error);
    }
  }

  private setupAutoUpdate(): void {
    if (this.getBooleanAttribute('auto-update')) {
      this.updateInterval = window.setInterval(() => {
        this.updateStorageInfo();
        this.updateNetworkInfo();
        this.render();
      }, 5000);
    }
  }

  protected getTemplate(): string {
    const isDemoMode = this.getBooleanAttribute('demo-mode');

    return `
      <div class="webapi-container">
        <h3>Modern Web APIs Demo</h3>
        <p class="webapi-description">
          Comprehensive demonstration of modern browser APIs with TypeScript integration and real-time updates.
        </p>

        <div class="api-controls">
          <button class="api-btn" data-action="geolocation">📍 Get Location</button>
          <button class="api-btn" data-action="notification">🔔 Test Notification</button>
          <button class="api-btn" data-action="camera">📷 Access Camera</button>
          <button class="api-btn" data-action="clipboard">📋 Read Clipboard</button>
          <button class="api-btn" data-action="wakeLock">🔒 Wake Lock</button>
          <button class="api-btn" data-action="fullscreen">⛶ Fullscreen</button>
        </div>

        <!-- Geolocation API -->
        <div class="api-section">
          <h4>🌍 Geolocation API</h4>
          <div class="api-content">
            ${this.state.geolocation ? `
              <div class="data-grid">
                <div class="data-item">
                  <span class="data-label">Latitude:</span>
                  <span class="data-value">${this.state.geolocation.latitude.toFixed(6)}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Longitude:</span>
                  <span class="data-value">${this.state.geolocation.longitude.toFixed(6)}</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Accuracy:</span>
                  <span class="data-value">${this.state.geolocation.accuracy.toFixed(2)} meters</span>
                </div>
                <div class="data-item">
                  <span class="data-label">Timestamp:</span>
                  <span class="data-value">${new Date(this.state.geolocation.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ` : `
              <div class="no-data">Click "Get Location" to retrieve geolocation data</div>
            `}
          </div>
        </div>

        <!-- Network Information API -->
        <div class="api-section">
          <h4>🌐 Network Information API</h4>
          <div class="api-content">
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Status:</span>
                <span class="data-value ${this.state.network.online ? 'online' : 'offline'}">
                  ${this.state.network.online ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
              ${this.state.network.effectiveType ? `
                <div class="data-item">
                  <span class="data-label">Connection Type:</span>
                  <span class="data-value">${this.state.network.effectiveType}</span>
                </div>
              ` : ''}
              ${this.state.network.downlink ? `
                <div class="data-item">
                  <span class="data-label">Downlink:</span>
                  <span class="data-value">${this.state.network.downlink} Mbps</span>
                </div>
              ` : ''}
              ${this.state.network.rtt ? `
                <div class="data-item">
                  <span class="data-label">RTT:</span>
                  <span class="data-value">${this.state.network.rtt} ms</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Storage API -->
        <div class="api-section">
          <h4>💾 Web Storage API</h4>
          <div class="api-content">
            <div class="storage-info">
              <div class="storage-type">
                <h5>Local Storage</h5>
                <div class="storage-bar">
                  <div class="storage-used" style="width: ${(this.state.storage.localStorage.used / (this.state.storage.localStorage.used + this.state.storage.localStorage.available)) * 100}%"></div>
                </div>
                <div class="storage-details">
                  <span>Used: ${this.formatBytes(this.state.storage.localStorage.used)}</span>
                  <span>Available: ${this.formatBytes(this.state.storage.localStorage.available)}</span>
                </div>
              </div>
              <div class="storage-type">
                <h5>Session Storage</h5>
                <div class="storage-bar">
                  <div class="storage-used" style="width: ${(this.state.storage.sessionStorage.used / (this.state.storage.sessionStorage.used + this.state.storage.sessionStorage.available)) * 100}%"></div>
                </div>
                <div class="storage-details">
                  <span>Used: ${this.formatBytes(this.state.storage.sessionStorage.used)}</span>
                  <span>Available: ${this.formatBytes(this.state.storage.sessionStorage.available)}</span>
                </div>
              </div>
            </div>
            <div class="storage-actions">
              <button class="storage-btn" data-action="addStorage">➕ Add Test Data</button>
              <button class="storage-btn" data-action="clearStorage">🗑️ Clear Storage</button>
            </div>
          </div>
        </div>

        <!-- Device Information -->
        <div class="api-section">
          <h4>📱 Device Information</h4>
          <div class="api-content">
            <div class="data-grid">
              <div class="data-item">
                <span class="data-label">Language:</span>
                <span class="data-value">${this.state.device.language}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Languages:</span>
                <span class="data-value">${this.state.device.languages.slice(0, 3).join(', ')}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Cookies Enabled:</span>
                <span class="data-value">${this.state.device.cookieEnabled ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div class="data-item">
                <span class="data-label">CPU Cores:</span>
                <span class="data-value">${this.state.device.hardwareConcurrency}</span>
              </div>
              <div class="data-item">
                <span class="data-label">Max Touch Points:</span>
                <span class="data-value">${this.state.device.maxTouchPoints}</span>
              </div>
              <div class="data-item">
                <span class="data-label">User Agent:</span>
                <span class="data-value user-agent">${this.state.device.userAgent}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Battery API -->
        ${this.state.battery ? `
          <div class="api-section">
            <h4>🔋 Battery Status API</h4>
            <div class="api-content">
              <div class="battery-info">
                <div class="battery-visual">
                  <div class="battery-level" style="width: ${this.state.battery.level * 100}%"></div>
                  <span class="battery-percentage">${Math.round(this.state.battery.level * 100)}%</span>
                </div>
                <div class="battery-details">
                  <div class="data-item">
                    <span class="data-label">Status:</span>
                    <span class="data-value">${this.state.battery.charging ? '🔌 Charging' : '🔋 Discharging'}</span>
                  </div>
                  <div class="data-item">
                    <span class="data-label">Charging Time:</span>
                    <span class="data-value">${this.formatTime(this.state.battery.chargingTime)}</span>
                  </div>
                  <div class="data-item">
                    <span class="data-label">Discharging Time:</span>
                    <span class="data-value">${this.formatTime(this.state.battery.dischargingTime)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Permissions Status -->
        <div class="api-section">
          <h4>🔐 Permissions API</h4>
          <div class="api-content">
            <div class="permissions-grid">
              <div class="permission-item">
                <span class="permission-label">📋 Notifications</span>
                <span class="permission-status ${this.state.notifications ? 'granted' : 'denied'}">
                  ${this.state.notifications ? '✅ Granted' : '❌ Denied'}
                </span>
              </div>
              <div class="permission-item">
                <span class="permission-label">📷 Camera</span>
                <span class="permission-status ${this.state.camera ? 'granted' : 'denied'}">
                  ${this.state.camera ? '✅ Granted' : '❌ Not Granted'}
                </span>
              </div>
              <div class="permission-item">
                <span class="permission-label">🎤 Microphone</span>
                <span class="permission-status ${this.state.microphone ? 'granted' : 'denied'}">
                  ${this.state.microphone ? '✅ Granted' : '❌ Not Granted'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Clipboard API -->
        <div class="api-section">
          <h4>📋 Clipboard API</h4>
          <div class="api-content">
            <div class="clipboard-demo">
              <textarea 
                class="clipboard-input" 
                placeholder="Type something to copy to clipboard..."
                rows="3"
              ></textarea>
              <div class="clipboard-actions">
                <button class="clipboard-btn" data-action="copy">📝 Copy Text</button>
                <button class="clipboard-btn" data-action="paste">📋 Paste Text</button>
              </div>
              ${this.state.clipboard ? `
                <div class="clipboard-result">
                  <strong>Last clipboard content:</strong>
                  <div class="clipboard-content">${this.state.clipboard}</div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- API Support Summary -->
        <div class="api-section">
          <h4>📊 API Support Summary</h4>
          <div class="api-content">
            <div class="support-grid">
              <div class="support-item">
                <span class="api-name">Geolocation API</span>
                <span class="support-status ${'geolocation' in navigator ? 'supported' : 'not-supported'}">
                  ${'geolocation' in navigator ? '✅' : '❌'}
                </span>
              </div>
              <div class="support-item">
                <span class="api-name">Notification API</span>
                <span class="support-status ${'Notification' in window ? 'supported' : 'not-supported'}">
                  ${'Notification' in window ? '✅' : '❌'}
                </span>
              </div>
              <div class="support-item">
                <span class="api-name">Battery API</span>
                <span class="support-status ${'getBattery' in navigator ? 'supported' : 'not-supported'}">
                  ${'getBattery' in navigator ? '✅' : '❌'}
                </span>
              </div>
              <div class="support-item">
                <span class="api-name">Wake Lock API</span>
                <span class="support-status ${'wakeLock' in navigator ? 'supported' : 'not-supported'}">
                  ${'wakeLock' in navigator ? '✅' : '❌'}
                </span>
              </div>
              <div class="support-item">
                <span class="api-name">Network Information</span>
                <span class="support-status ${'connection' in navigator ? 'supported' : 'not-supported'}">
                  ${'connection' in navigator ? '✅' : '❌'}
                </span>
              </div>
              <div class="support-item">
                <span class="api-name">Clipboard API</span>
                <span class="support-status ${'clipboard' in navigator ? 'supported' : 'not-supported'}">
                  ${'clipboard' in navigator ? '✅' : '❌'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatTime(seconds: number): string {
    if (seconds === Infinity || seconds === 0) return 'Unknown';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  protected getStyles(): string {
    return `
      :host {
        display: block;
        width: 100%;
      }

      .webapi-container {
        background: rgba(255, 255, 255, 0.05);
        padding: 24px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      h3 {
        color: #667eea;
        margin: 0 0 8px 0;
        font-size: 1.4rem;
      }

      .webapi-description {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 24px 0;
        line-height: 1.5;
      }

      .api-controls {
        display: flex;
        gap: 8px;
        margin-bottom: 30px;
        flex-wrap: wrap;
      }

      .api-btn, .storage-btn, .clipboard-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
      }

      .api-btn:hover, .storage-btn:hover, .clipboard-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .api-section {
        background: rgba(255, 255, 255, 0.05);
        margin-bottom: 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
      }

      .api-section h4 {
        color: #fff;
        margin: 0;
        padding: 16px 20px;
        background: rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 1.1rem;
      }

      .api-content {
        padding: 20px;
      }

      .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 12px;
      }

      .data-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .data-item:last-child {
        border-bottom: none;
      }

      .data-label {
        color: rgba(255, 255, 255, 0.7);
        font-weight: 500;
      }

      .data-value {
        color: #667eea;
        font-weight: 600;
        text-align: right;
        max-width: 60%;
        word-break: break-word;
      }

      .data-value.online {
        color: #27ae60;
      }

      .data-value.offline {
        color: #e74c3c;
      }

      .user-agent {
        font-size: 0.8rem;
        font-family: monospace;
      }

      .no-data {
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
        text-align: center;
        padding: 20px;
      }

      .storage-info {
        margin-bottom: 20px;
      }

      .storage-type {
        margin-bottom: 20px;
      }

      .storage-type h5 {
        color: #fff;
        margin: 0 0 8px 0;
        font-size: 1rem;
      }

      .storage-bar {
        width: 100%;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }

      .storage-used {
        height: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        transition: width 0.3s ease;
      }

      .storage-details {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
      }

      .storage-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .battery-info {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .battery-visual {
        width: 200px;
        height: 40px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        position: relative;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 auto;
      }

      .battery-visual::after {
        content: '';
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 0 2px 2px 0;
      }

      .battery-level {
        height: 100%;
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        transition: width 0.3s ease;
        border-radius: 2px;
      }

      .battery-percentage {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-weight: bold;
        font-size: 0.9rem;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }

      .battery-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }

      .permissions-grid, .support-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
      }

      .permission-item, .support-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .permission-label, .api-name {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
      }

      .permission-status, .support-status {
        font-weight: 600;
        font-size: 0.9rem;
      }

      .permission-status.granted, .support-status.supported {
        color: #27ae60;
      }

      .permission-status.denied, .support-status.not-supported {
        color: #e74c3c;
      }

      .clipboard-demo {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .clipboard-input {
        width: 100%;
        padding: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-family: inherit;
        font-size: 1rem;
        resize: vertical;
        box-sizing: border-box;
      }

      .clipboard-input:focus {
        outline: none;
        border-color: #667eea;
        background: rgba(255, 255, 255, 0.15);
      }

      .clipboard-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .clipboard-result {
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .clipboard-result strong {
        color: #667eea;
        display: block;
        margin-bottom: 8px;
      }

      .clipboard-content {
        background: rgba(0, 0, 0, 0.2);
        padding: 8px;
        border-radius: 4px;
        font-family: monospace;
        color: rgba(255, 255, 255, 0.9);
        word-break: break-word;
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .api-controls {
          gap: 6px;
        }
        
        .api-btn, .storage-btn, .clipboard-btn {
          padding: 6px 10px;
          font-size: 0.8rem;
        }
        
        .data-grid {
          grid-template-columns: 1fr;
        }
        
        .data-item {
          flex-direction: column;
          gap: 4px;
        }
        
        .data-value {
          text-align: left;
          max-width: 100%;
        }
        
        .battery-visual {
          width: 150px;
          height: 30px;
        }
        
        .battery-percentage {
          font-size: 0.8rem;
        }
        
        .permissions-grid, .support-grid {
          grid-template-columns: 1fr;
        }
        
        .storage-actions, .clipboard-actions {
          flex-direction: column;
        }
        
        .storage-btn, .clipboard-btn {
          width: 100%;
        }
      }
    `;
  }

  protected setupEventListeners(): void {
    this.shadow.addEventListener('click', this.handleClick.bind(this));
    
    // Listen for online/offline events
    window.addEventListener('online', this.updateNetworkStatus.bind(this));
    window.addEventListener('offline', this.updateNetworkStatus.bind(this));
    
    // Listen for connection changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', this.updateNetworkStatus.bind(this));
    }
  }

  private updateNetworkStatus(): void {
    this.updateNetworkInfo();
    this.render();
  }

  private async handleClick(event: Event): Promise<void> {
    const target = event.target as HTMLElement;
    const action = target.getAttribute('data-action');

    if (!action) return;

    event.preventDefault();

    switch (action) {
      case 'geolocation':
        await this.getGeolocation();
        break;
      case 'notification':
        await this.showNotification();
        break;
      case 'camera':
        await this.accessCamera();
        break;
      case 'clipboard':
        await this.readClipboard();
        break;
      case 'wakeLock':
        await this.requestWakeLock();
        break;
      case 'fullscreen':
        await this.toggleFullscreen();
        break;
      case 'addStorage':
        this.addTestStorage();
        break;
      case 'clearStorage':
        this.clearStorage();
        break;
      case 'copy':
        await this.copyToClipboard();
        break;
      case 'paste':
        await this.pasteFromClipboard();
        break;
    }
  }

  private async getGeolocation(): Promise<void> {
    if (!('geolocation' in navigator)) {
      this.emit('apiError', { api: 'geolocation', error: 'Not supported' });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      this.state.geolocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      this.render();
      this.emit('geolocationUpdate', this.state.geolocation);
    } catch (error) {
      this.emit('apiError', { api: 'geolocation', error });
    }
  }

  private async showNotification(): Promise<void> {
    if (!('Notification' in window)) {
      this.emit('apiError', { api: 'notification', error: 'Not supported' });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        new Notification('TypeScript Web Components Demo', {
          body: 'This notification was triggered by the Web API Demo component!',
          icon: '/favicon.ico',
          tag: 'demo-notification'
        });
        
        this.state.notifications = true;
        this.render();
        this.emit('notificationSent', { permission });
      }
    } catch (error) {
      this.emit('apiError', { api: 'notification', error });
    }
  }

  private async accessCamera(): Promise<void> {
    if (!('mediaDevices' in navigator)) {
      this.emit('apiError', { api: 'camera', error: 'Not supported' });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 },
        audio: false
      });
      
      // Create a video element to test the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      
      // Stop the stream after verification
      stream.getTracks().forEach(track => track.stop());
      
      this.state.camera = true;
      this.render();
      this.emit('cameraAccess', { success: true });
    } catch (error) {
      this.emit('apiError', { api: 'camera', error });
    }
  }

  private async readClipboard(): Promise<void> {
    if (!('clipboard' in navigator)) {
      this.emit('apiError', { api: 'clipboard', error: 'Not supported' });
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      this.state.clipboard = text;
      this.render();
      this.emit('clipboardRead', { text });
    } catch (error) {
      this.emit('apiError', { api: 'clipboard', error });
    }
  }

  private async copyToClipboard(): Promise<void> {
    const textarea = this.$('.clipboard-input') as HTMLTextAreaElement;
    if (!textarea || !textarea.value.trim()) return;

    try {
      await navigator.clipboard.writeText(textarea.value);
      this.emit('clipboardWrite', { text: textarea.value });
    } catch (error) {
      this.emit('apiError', { api: 'clipboard', error });
    }
  }

  private async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      const textarea = this.$('.clipboard-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = text;
        this.state.clipboard = text;
        this.render();
      }
      this.emit('clipboardPaste', { text });
    } catch (error) {
      this.emit('apiError', { api: 'clipboard', error });
    }
  }

  private async requestWakeLock(): Promise<void> {
    if (!('wakeLock' in navigator)) {
      this.emit('apiError', { api: 'wakeLock', error: 'Not supported' });
      return;
    }

    try {
      if (this.state.wakeLock) {
        await this.state.wakeLock.release();
        this.state.wakeLock = null;
        this.emit('wakeLockReleased', {});
      } else {
        this.state.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.emit('wakeLockAcquired', {});
      }
    } catch (error) {
      this.emit('apiError', { api: 'wakeLock', error });
    }
  }

  private async toggleFullscreen(): Promise<void> {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        this.emit('fullscreenEnter', {});
      } catch (error) {
        this.emit('apiError', { api: 'fullscreen', error });
      }
    } else {
      try {
        await document.exitFullscreen();
        this.emit('fullscreenExit', {});
      } catch (error) {
        this.emit('apiError', { api: 'fullscreen', error });
      }
    }
  }

  private addTestStorage(): void {
    const timestamp = Date.now();
    const testData = `Test data ${timestamp}`;
    
    localStorage.setItem(`test_${timestamp}`, testData);
    sessionStorage.setItem(`session_${timestamp}`, `Session ${testData}`);
    
    this.updateStorageInfo();
    this.render();
    this.emit('storageUpdate', { action: 'add', timestamp });
  }

  private clearStorage(): void {
    // Only clear test data
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('test_')) {
        localStorage.removeItem(key);
      }
    }
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('session_')) {
        sessionStorage.removeItem(key);
      }
    }
    
    this.updateStorageInfo();
    this.render();
    this.emit('storageUpdate', { action: 'clear' });
  }

  protected onAttributeChanged(name: string, oldValue: string, newValue: string): void {
    if (name === 'auto-update') {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      this.setupAutoUpdate();
    }
  }

  protected cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    
    if (this.state.wakeLock) {
      this.state.wakeLock.release();
    }

    window.removeEventListener('online', this.updateNetworkStatus.bind(this));
    window.removeEventListener('offline', this.updateNetworkStatus.bind(this));
  }

  // Public API methods
  public getAPISupport(): Record<string, boolean> {
    return {
      geolocation: 'geolocation' in navigator,
      notification: 'Notification' in window,
      battery: 'getBattery' in navigator,
      wakeLock: 'wakeLock' in navigator,
      networkInformation: 'connection' in navigator,
      clipboard: 'clipboard' in navigator,
      camera: 'mediaDevices' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement
    };
  }

  public getCurrentData(): Readonly<WebAPIState> {
    return { ...this.state };
  }
}