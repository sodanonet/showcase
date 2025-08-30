export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  outline?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onClick?: (event: MouseEvent) => void;
}

export class Button extends HTMLElement {
  private props: ButtonProps = {};
  private button: HTMLButtonElement;

  static get observedAttributes() {
    return [
      'variant',
      'size', 
      'disabled',
      'loading',
      'full-width',
      'rounded',
      'outline',
      'icon',
      'icon-position'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.button = document.createElement('button');
    this.setupComponent();
  }

  private setupComponent() {
    this.button.type = 'button';
    this.button.innerHTML = `
      <span class="button-content">
        <span class="icon-left"></span>
        <span class="text"><slot></slot></span>
        <span class="icon-right"></span>
        <span class="loading-spinner"></span>
      </span>
    `;

    this.button.addEventListener('click', (e) => {
      if (!this.props.disabled && !this.props.loading) {
        this.props.onClick?.(e);
        this.dispatchEvent(new CustomEvent('button-click', { 
          detail: { originalEvent: e, props: this.props }
        }));
      }
    });

    const style = document.createElement('style');
    style.textContent = this.getStyles();

    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(this.button);
  }

  private getStyles(): string {
    return `
      :host {
        display: inline-block;
        --button-border-radius: 6px;
        --button-font-family: system-ui, -apple-system, sans-serif;
        --button-font-weight: 500;
        --button-transition: all 0.2s ease-in-out;
      }

      :host([full-width]) {
        display: block;
        width: 100%;
      }

      button {
        font-family: var(--button-font-family);
        font-weight: var(--button-font-weight);
        border: 2px solid;
        cursor: pointer;
        transition: var(--button-transition);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        outline: none;
        user-select: none;
        white-space: nowrap;
        width: 100%;
        margin: 0;
        background: none;
      }

      button:focus-visible {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }

      .button-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        position: relative;
      }

      .icon-left,
      .icon-right {
        display: none;
        width: 1em;
        height: 1em;
      }

      .loading-spinner {
        display: none;
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Size variants */
      :host([size="small"]) button {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        min-height: 2rem;
      }

      :host([size="medium"]) button {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        min-height: 2.5rem;
      }

      :host([size="large"]) button {
        padding: 1rem 2rem;
        font-size: 1.125rem;
        min-height: 3rem;
      }

      /* Rounded variant */
      :host([rounded]) button {
        border-radius: 2rem;
      }

      :host(:not([rounded])) button {
        border-radius: var(--button-border-radius);
      }

      /* Color variants */
      :host([variant="primary"]) button {
        background-color: #0066cc;
        border-color: #0066cc;
        color: white;
      }

      :host([variant="primary"]) button:hover:not(:disabled) {
        background-color: #0052a3;
        border-color: #0052a3;
      }

      :host([variant="secondary"]) button {
        background-color: #6c757d;
        border-color: #6c757d;
        color: white;
      }

      :host([variant="secondary"]) button:hover:not(:disabled) {
        background-color: #545b62;
        border-color: #545b62;
      }

      :host([variant="success"]) button {
        background-color: #28a745;
        border-color: #28a745;
        color: white;
      }

      :host([variant="success"]) button:hover:not(:disabled) {
        background-color: #218838;
        border-color: #218838;
      }

      :host([variant="danger"]) button {
        background-color: #dc3545;
        border-color: #dc3545;
        color: white;
      }

      :host([variant="danger"]) button:hover:not(:disabled) {
        background-color: #c82333;
        border-color: #c82333;
      }

      :host([variant="warning"]) button {
        background-color: #ffc107;
        border-color: #ffc107;
        color: #212529;
      }

      :host([variant="warning"]) button:hover:not(:disabled) {
        background-color: #e0a800;
        border-color: #e0a800;
      }

      :host([variant="info"]) button {
        background-color: #17a2b8;
        border-color: #17a2b8;
        color: white;
      }

      :host([variant="info"]) button:hover:not(:disabled) {
        background-color: #138496;
        border-color: #138496;
      }

      /* Outline variants */
      :host([outline]) button {
        background-color: transparent;
        color: currentColor;
      }

      :host([outline][variant="primary"]) button {
        color: #0066cc;
        background-color: transparent;
      }

      :host([outline][variant="primary"]) button:hover:not(:disabled) {
        background-color: #0066cc;
        color: white;
      }

      :host([outline][variant="danger"]) button {
        color: #dc3545;
        background-color: transparent;
      }

      :host([outline][variant="danger"]) button:hover:not(:disabled) {
        background-color: #dc3545;
        color: white;
      }

      /* Disabled state */
      :host([disabled]) button,
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      /* Loading state */
      :host([loading]) .text,
      :host([loading]) .icon-left,
      :host([loading]) .icon-right {
        opacity: 0;
      }

      :host([loading]) .loading-spinner {
        display: block;
      }

      :host([loading]) button {
        cursor: not-allowed;
      }

      /* Icon states */
      :host([icon][icon-position="left"]) .icon-left {
        display: block;
      }

      :host([icon][icon-position="right"]) .icon-right {
        display: block;
      }
    `;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateProps();
      this.updateComponent();
    }
  }

  private updateProps() {
    this.props = {
      variant: (this.getAttribute('variant') as ButtonProps['variant']) || 'primary',
      size: (this.getAttribute('size') as ButtonProps['size']) || 'medium',
      disabled: this.hasAttribute('disabled'),
      loading: this.hasAttribute('loading'),
      fullWidth: this.hasAttribute('full-width'),
      rounded: this.hasAttribute('rounded'),
      outline: this.hasAttribute('outline'),
      icon: this.getAttribute('icon') || undefined,
      iconPosition: (this.getAttribute('icon-position') as ButtonProps['iconPosition']) || 'left',
    };
  }

  private updateComponent() {
    this.button.disabled = this.props.disabled || this.props.loading || false;
    
    // Update icon content
    if (this.props.icon) {
      const iconContainer = this.props.iconPosition === 'left' 
        ? this.shadowRoot!.querySelector('.icon-left')
        : this.shadowRoot!.querySelector('.icon-right');
      
      if (iconContainer) {
        iconContainer.innerHTML = this.props.icon;
      }
    }
  }

  connectedCallback() {
    this.updateProps();
    this.updateComponent();
  }

  // Public API
  public override click() {
    if (!this.props.disabled && !this.props.loading) {
      this.button.click();
    }
  }

  public override focus() {
    this.button.focus();
  }

  public override blur() {
    this.button.blur();
  }

  public setLoading(loading: boolean) {
    if (loading) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }
}

// Register the custom element
customElements.define('ui-button', Button);

export { Button as UIButton };