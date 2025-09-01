import { BaseWebComponent } from '../base/BaseWebComponent';
import { Component, ObservedAttributes } from '../decorators/Component';

interface CounterState {
  value: number;
  step: number;
  min?: number;
  max?: number;
}

@Component('ts-interactive-counter')
export class InteractiveCounter extends BaseWebComponent {
  private state: CounterState = {
    value: 0,
    step: 1
  };

  private animationFrameId: number | null = null;

  static get observedAttributes(): string[] {
    return ['initial-value', 'step', 'min', 'max', 'disabled'];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initializeState();
  }

  private initializeState(): void {
    this.state = {
      value: this.getNumberAttribute('initial-value', 0),
      step: this.getNumberAttribute('step', 1),
      min: this.hasAttribute('min') ? this.getNumberAttribute('min') : undefined,
      max: this.hasAttribute('max') ? this.getNumberAttribute('max') : undefined
    };
  }

  protected getTemplate(): string {
    const isDisabled = this.getBooleanAttribute('disabled');
    const canDecrement = this.state.min === undefined || this.state.value > this.state.min;
    const canIncrement = this.state.max === undefined || this.state.value < this.state.max;

    return `
      <div class="counter-container">
        <h3>Interactive Counter</h3>
        <p class="counter-description">
          TypeScript-powered counter with type-safe state management and Web Component lifecycle.
        </p>
        
        <div class="counter-controls">
          <button 
            class="counter-btn decrement" 
            ${isDisabled || !canDecrement ? 'disabled' : ''}
            data-action="decrement"
          >
            <span class="btn-icon">−</span>
          </button>
          
          <div class="counter-display">
            <span class="counter-value" data-value="${this.state.value}">${this.state.value}</span>
            <div class="counter-info">
              <small>Step: ${this.state.step}</small>
              ${this.state.min !== undefined ? `<small>Min: ${this.state.min}</small>` : ''}
              ${this.state.max !== undefined ? `<small>Max: ${this.state.max}</small>` : ''}
            </div>
          </div>
          
          <button 
            class="counter-btn increment" 
            ${isDisabled || !canIncrement ? 'disabled' : ''}
            data-action="increment"
          >
            <span class="btn-icon">+</span>
          </button>
        </div>

        <div class="counter-actions">
          <button class="action-btn reset" data-action="reset" ${isDisabled ? 'disabled' : ''}>
            🔄 Reset
          </button>
          <button class="action-btn double" data-action="double" ${isDisabled ? 'disabled' : ''}>
            ✖️ Double
          </button>
          <button class="action-btn randomize" data-action="randomize" ${isDisabled ? 'disabled' : ''}>
            🎲 Random
          </button>
        </div>

        <div class="counter-stats">
          <div class="stat-item">
            <span class="stat-label">Current Value:</span>
            <span class="stat-value">${this.state.value}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Is Even:</span>
            <span class="stat-value">${this.state.value % 2 === 0 ? 'Yes' : 'No'}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Absolute:</span>
            <span class="stat-value">${Math.abs(this.state.value)}</span>
          </div>
        </div>
      </div>
    `;
  }

  protected getStyles(): string {
    return `
      :host {
        display: block;
        width: 100%;
      }

      .counter-container {
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

      .counter-description {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 24px 0;
        line-height: 1.5;
      }

      .counter-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        margin: 24px 0;
        flex-wrap: wrap;
      }

      .counter-btn {
        width: 60px;
        height: 60px;
        border: none;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .counter-btn:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
      }

      .counter-btn:active:not(:disabled) {
        transform: translateY(0) scale(0.98);
      }

      .counter-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      .counter-btn.decrement {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
      }

      .counter-btn.decrement:hover:not(:disabled) {
        box-shadow: 0 8px 25px rgba(231, 76, 60, 0.4);
      }

      .counter-btn.increment {
        background: linear-gradient(135deg, #27ae60, #229954);
        box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
      }

      .counter-btn.increment:hover:not(:disabled) {
        box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
      }

      .counter-display {
        text-align: center;
        min-width: 120px;
      }

      .counter-value {
        display: block;
        font-size: 3rem;
        font-weight: 800;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
      }

      .counter-value.updating {
        transform: scale(1.1);
        color: #667eea;
      }

      .counter-info {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .counter-info small {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.8rem;
      }

      .counter-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin: 24px 0;
        flex-wrap: wrap;
      }

      .action-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        backdrop-filter: blur(5px);
      }

      .action-btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .counter-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        margin-top: 24px;
      }

      .stat-item {
        background: rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .stat-label {
        display: block;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        margin-bottom: 4px;
      }

      .stat-value {
        display: block;
        color: #667eea;
        font-weight: 600;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      .counter-value.animate {
        animation: pulse 0.3s ease;
      }

      @media (max-width: 768px) {
        .counter-controls {
          gap: 16px;
        }
        
        .counter-btn {
          width: 50px;
          height: 50px;
          font-size: 20px;
        }
        
        .counter-value {
          font-size: 2.5rem;
        }
        
        .counter-actions {
          gap: 8px;
        }
        
        .action-btn {
          padding: 6px 12px;
          font-size: 0.8rem;
        }
      }
    `;
  }

  protected setupEventListeners(): void {
    this.shadow.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const action = target.closest('[data-action]')?.getAttribute('data-action');
    
    if (!action) return;

    event.preventDefault();
    
    switch (action) {
      case 'increment':
        this.increment();
        break;
      case 'decrement':
        this.decrement();
        break;
      case 'reset':
        this.reset();
        break;
      case 'double':
        this.double();
        break;
      case 'randomize':
        this.randomize();
        break;
    }
  }

  private increment(): void {
    const newValue = this.state.value + this.state.step;
    if (this.state.max === undefined || newValue <= this.state.max) {
      this.updateValue(newValue);
    }
  }

  private decrement(): void {
    const newValue = this.state.value - this.state.step;
    if (this.state.min === undefined || newValue >= this.state.min) {
      this.updateValue(newValue);
    }
  }

  private reset(): void {
    this.updateValue(this.getNumberAttribute('initial-value', 0));
  }

  private double(): void {
    const newValue = this.state.value * 2;
    if (this.state.max === undefined || newValue <= this.state.max) {
      this.updateValue(newValue);
    }
  }

  private randomize(): void {
    const min = this.state.min ?? -100;
    const max = this.state.max ?? 100;
    const newValue = Math.floor(Math.random() * (max - min + 1)) + min;
    this.updateValue(newValue);
  }

  private updateValue(newValue: number): void {
    const oldValue = this.state.value;
    this.state.value = newValue;
    
    // Animate the value change
    this.animateValueChange();
    
    // Emit custom event
    this.emit('valueChange', { 
      oldValue, 
      newValue, 
      step: this.state.step 
    });
    
    // Re-render to update the UI
    this.render();
  }

  private animateValueChange(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame(() => {
      const valueElement = this.$('.counter-value');
      if (valueElement) {
        valueElement.classList.add('animate');
        setTimeout(() => {
          valueElement.classList.remove('animate');
        }, 300);
      }
    });
  }

  protected onAttributeChanged(name: string, oldValue: string, newValue: string): void {
    this.initializeState();
  }

  protected cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // Public API methods
  public getValue(): number {
    return this.state.value;
  }

  public setValue(value: number): void {
    this.updateValue(value);
  }

  public getState(): Readonly<CounterState> {
    return { ...this.state };
  }
}