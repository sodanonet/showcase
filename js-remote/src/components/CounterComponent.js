// Modern JavaScript Counter Component with ES2022+ features
export class CounterComponent {
  // Private fields - ES2022 feature
  #value = 0;
  #step = 1;
  #min = null;
  #max = null;
  #container = null;
  #onUpdate = null;
  #animationFrame = null;

  constructor(options = {}) {
    // Using destructuring with default values
    const { 
      initialValue = 0, 
      step = 1, 
      min = null, 
      max = null, 
      onUpdate = null 
    } = options;
    
    this.#value = initialValue;
    this.#step = step;
    this.#min = min;
    this.#max = max;
    this.#onUpdate = onUpdate;
  }

  async mount(container) {
    this.#container = container;
    await this.#render();
    this.#setupEventListeners();
  }

  async #render() {
    // Using template literals with embedded logic
    const canDecrement = this.#min === null || this.#value > this.#min;
    const canIncrement = this.#max === null || this.#value < this.#max;

    const template = `
      <div class="counter-container">
        <div class="counter-display" id="counter-display">${this.#value}</div>
        
        <div class="counter-controls">
          <button 
            class="counter-btn decrement" 
            ${!canDecrement ? 'disabled' : ''}
            data-action="decrement"
          >
            −
          </button>
          
          <button 
            class="counter-btn increment"
            ${!canIncrement ? 'disabled' : ''}
            data-action="increment"
          >
            +
          </button>
        </div>

        <div class="counter-info">
          <div class="data-container">
            <div class="data-item">
              <span class="data-label">Current Value:</span>
              <span class="data-value">${this.#value}</span>
            </div>
            <div class="data-item">
              <span class="data-label">Step Size:</span>
              <span class="data-value">${this.#step}</span>
            </div>
            ${this.#min !== null ? `
              <div class="data-item">
                <span class="data-label">Minimum:</span>
                <span class="data-value">${this.#min}</span>
              </div>
            ` : ''}
            ${this.#max !== null ? `
              <div class="data-item">
                <span class="data-label">Maximum:</span>
                <span class="data-value">${this.#max}</span>
              </div>
            ` : ''}
            <div class="data-item">
              <span class="data-label">Is Even:</span>
              <span class="data-value">${this.#value % 2 === 0 ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div class="counter-actions">
          <button class="btn btn-secondary btn-small" data-action="reset">
            🔄 Reset
          </button>
          <button class="btn btn-secondary btn-small" data-action="random">
            🎲 Random
          </button>
          <button class="btn btn-secondary btn-small" data-action="double">
            ✖️ Double
          </button>
        </div>
      </div>
    `;

    this.#container.innerHTML = template;
  }

  #setupEventListeners() {
    // Using modern event delegation
    this.#container.addEventListener('click', this.#handleClick.bind(this));
  }

  #handleClick = (event) => {
    const action = event.target.getAttribute('data-action');
    if (!action) return;

    event.preventDefault();

    // Using a switch statement with modern syntax
    switch (action) {
      case 'increment':
        this.#increment();
        break;
      case 'decrement':
        this.#decrement();
        break;
      case 'reset':
        this.#reset();
        break;
      case 'random':
        this.#randomize();
        break;
      case 'double':
        this.#double();
        break;
    }
  };

  #increment() {
    const newValue = this.#value + this.#step;
    if (this.#max === null || newValue <= this.#max) {
      this.#updateValue(newValue);
    }
  }

  #decrement() {
    const newValue = this.#value - this.#step;
    if (this.#min === null || newValue >= this.#min) {
      this.#updateValue(newValue);
    }
  }

  #reset() {
    this.#updateValue(0);
  }

  #double() {
    const newValue = this.#value * 2;
    if (this.#max === null || newValue <= this.#max) {
      this.#updateValue(newValue);
    }
  }

  #randomize() {
    const min = this.#min ?? -100;
    const max = this.#max ?? 100;
    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    this.#updateValue(randomValue);
  }

  async #updateValue(newValue) {
    const oldValue = this.#value;
    this.#value = newValue;

    // Animate the value change
    await this.#animateValueChange();

    // Re-render to update all displays
    await this.#render();
    this.#setupEventListeners();

    // Call the update callback
    this.#onUpdate?.(this.#value);

    // Dispatch custom event using modern event system
    this.#dispatchUpdateEvent(oldValue, newValue);
  }

  async #animateValueChange() {
    return new Promise((resolve) => {
      const display = this.#container.querySelector('#counter-display');
      if (!display) {
        resolve();
        return;
      }

      // Add updating class for animation
      display.classList.add('updating');

      // Use requestAnimationFrame for smooth animation
      this.#animationFrame = requestAnimationFrame(() => {
        // Update the display value
        display.textContent = this.#value;

        // Remove animation class after animation completes
        setTimeout(() => {
          display.classList.remove('updating');
          resolve();
        }, 300);
      });
    });
  }

  #dispatchUpdateEvent(oldValue, newValue) {
    const event = new CustomEvent('counterUpdate', {
      detail: {
        oldValue,
        newValue,
        step: this.#step,
        timestamp: Date.now()
      },
      bubbles: true,
      composed: true
    });

    this.#container.dispatchEvent(event);
  }

  // Public getters using modern syntax
  get value() {
    return this.#value;
  }

  get step() {
    return this.#step;
  }

  get min() {
    return this.#min;
  }

  get max() {
    return this.#max;
  }

  // Public methods for external control
  setValue(value) {
    if (typeof value !== 'number') {
      throw new TypeError('Value must be a number');
    }

    // Validate bounds
    if (this.#min !== null && value < this.#min) {
      throw new RangeError(`Value ${value} is below minimum ${this.#min}`);
    }

    if (this.#max !== null && value > this.#max) {
      throw new RangeError(`Value ${value} is above maximum ${this.#max}`);
    }

    this.#updateValue(value);
  }

  setStep(step) {
    if (typeof step !== 'number' || step <= 0) {
      throw new TypeError('Step must be a positive number');
    }

    this.#step = step;
    this.#render();
  }

  setBounds(min, max) {
    if (min !== null && max !== null && min >= max) {
      throw new RangeError('Minimum must be less than maximum');
    }

    this.#min = min;
    this.#max = max;
    
    // Ensure current value is within new bounds
    if (this.#min !== null && this.#value < this.#min) {
      this.#updateValue(this.#min);
    } else if (this.#max !== null && this.#value > this.#max) {
      this.#updateValue(this.#max);
    } else {
      this.#render();
    }
  }

  // Cleanup method
  destroy() {
    if (this.#animationFrame) {
      cancelAnimationFrame(this.#animationFrame);
    }

    if (this.#container) {
      this.#container.innerHTML = '';
      this.#container = null;
    }

    this.#onUpdate = null;
  }

  // Static factory method demonstrating modern patterns
  static create(options) {
    return new CounterComponent(options);
  }

  // Modern JavaScript: toJSON for serialization
  toJSON() {
    return {
      value: this.#value,
      step: this.#step,
      min: this.#min,
      max: this.#max
    };
  }

  // Modern JavaScript: toString with template literals
  toString() {
    return `CounterComponent(value: ${this.#value}, step: ${this.#step})`;
  }
}