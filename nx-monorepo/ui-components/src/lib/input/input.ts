export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined' | 'underlined';
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  placeholder?: string;
  value?: string;
  label?: string;
  helpText?: string;
  errorMessage?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

export class Input extends HTMLElement {
  private props: InputProps = {};
  private inputElement!: HTMLInputElement;
  private labelElement: HTMLLabelElement | null = null;
  private helpTextElement: HTMLElement | null = null;
  private errorElement: HTMLElement | null = null;
  private container!: HTMLDivElement;
  private inputWrapper!: HTMLDivElement;

  static get observedAttributes() {
    return [
      'type',
      'size',
      'variant',
      'disabled',
      'readonly',
      'required',
      'invalid',
      'placeholder',
      'value',
      'label',
      'help-text',
      'error-message',
      'icon',
      'icon-position',
      'clearable',
      'maxlength',
      'minlength',
      'pattern'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupComponent();
  }

  private setupComponent() {
    this.container = document.createElement('div');
    this.container.className = 'input-container';
    
    this.inputWrapper = document.createElement('div');
    this.inputWrapper.className = 'input-wrapper';
    
    this.inputElement = document.createElement('input');
    this.inputElement.className = 'input';
    
    // Event listeners
    this.inputElement.addEventListener('input', (e) => {
      this.updateValue((e.target as HTMLInputElement).value);
      this.dispatchEvent(new CustomEvent('input', { 
        detail: { value: this.inputElement.value, originalEvent: e }
      }));
    });

    this.inputElement.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('change', { 
        detail: { value: this.inputElement.value, originalEvent: e }
      }));
    });

    this.inputElement.addEventListener('focus', (e) => {
      this.inputWrapper.classList.add('focused');
      this.dispatchEvent(new CustomEvent('focus', { 
        detail: { originalEvent: e }
      }));
    });

    this.inputElement.addEventListener('blur', (e) => {
      this.inputWrapper.classList.remove('focused');
      this.validateInput();
      this.dispatchEvent(new CustomEvent('blur', { 
        detail: { originalEvent: e }
      }));
    });

    const style = document.createElement('style');
    style.textContent = this.getStyles();

    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(this.container);
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
        --input-border-color: #d1d5db;
        --input-border-color-focus: #0066cc;
        --input-border-color-error: #dc3545;
        --input-background: #ffffff;
        --input-text-color: #374151;
        --input-placeholder-color: #9ca3af;
        --input-border-radius: 6px;
        --input-font-family: system-ui, -apple-system, sans-serif;
        --input-transition: all 0.2s ease-in-out;
      }

      .input-container {
        font-family: var(--input-font-family);
      }

      .label {
        display: block;
        font-weight: 500;
        color: var(--input-text-color);
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }

      .label.required::after {
        content: ' *';
        color: var(--input-border-color-error);
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input {
        width: 100%;
        border: 1px solid var(--input-border-color);
        border-radius: var(--input-border-radius);
        background-color: var(--input-background);
        color: var(--input-text-color);
        transition: var(--input-transition);
        font-family: inherit;
        outline: none;
        appearance: none;
      }

      .input::placeholder {
        color: var(--input-placeholder-color);
      }

      .input:focus {
        border-color: var(--input-border-color-focus);
        box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
      }

      /* Size variants */
      :host([size="small"]) .input {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        min-height: 2rem;
      }

      :host([size="medium"]) .input,
      :host(:not([size])) .input {
        padding: 0.75rem 1rem;
        font-size: 1rem;
        min-height: 2.5rem;
      }

      :host([size="large"]) .input {
        padding: 1rem 1.25rem;
        font-size: 1.125rem;
        min-height: 3rem;
      }

      /* Variant styles */
      :host([variant="filled"]) .input {
        background-color: #f3f4f6;
        border-color: transparent;
      }

      :host([variant="filled"]) .input:focus {
        background-color: var(--input-background);
        border-color: var(--input-border-color-focus);
      }

      :host([variant="outlined"]) .input {
        border-width: 2px;
      }

      :host([variant="underlined"]) .input {
        border: none;
        border-bottom: 2px solid var(--input-border-color);
        border-radius: 0;
        background-color: transparent;
      }

      :host([variant="underlined"]) .input:focus {
        box-shadow: none;
        border-bottom-color: var(--input-border-color-focus);
      }

      /* States */
      :host([disabled]) .input {
        opacity: 0.6;
        cursor: not-allowed;
        background-color: #f9fafb;
      }

      :host([readonly]) .input {
        background-color: #f9fafb;
        cursor: default;
      }

      :host([invalid]) .input {
        border-color: var(--input-border-color-error);
      }

      :host([invalid]) .input:focus {
        border-color: var(--input-border-color-error);
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }

      /* Icons */
      .icon {
        position: absolute;
        width: 1.25rem;
        height: 1.25rem;
        color: #6b7280;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon-left {
        left: 0.75rem;
      }

      .icon-right {
        right: 0.75rem;
      }

      :host([icon][icon-position="left"]) .input {
        padding-left: 2.5rem;
      }

      :host([icon][icon-position="right"]) .input {
        padding-right: 2.5rem;
      }

      /* Clear button */
      .clear-button {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        padding: 0.25rem;
        border-radius: 3px;
        display: none;
        align-items: center;
        justify-content: center;
      }

      .clear-button:hover {
        color: #374151;
        background-color: #f3f4f6;
      }

      :host([clearable]) .input-wrapper.has-value .clear-button {
        display: flex;
      }

      :host([clearable]) .input {
        padding-right: 2.5rem;
      }

      /* Help text */
      .help-text {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: #6b7280;
      }

      /* Error message */
      .error-message {
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: var(--input-border-color-error);
        display: none;
      }

      :host([invalid]) .error-message {
        display: block;
      }

      :host([invalid]) .help-text {
        display: none;
      }

      /* Focus styles */
      .input-wrapper.focused {
        /* Additional focus styling can be added here */
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        :host {
          --input-border-color: #4b5563;
          --input-background: #1f2937;
          --input-text-color: #f9fafb;
          --input-placeholder-color: #6b7280;
        }

        :host([variant="filled"]) .input {
          background-color: #374151;
        }

        :host([disabled]) .input,
        :host([readonly]) .input {
          background-color: #374151;
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        :host([size="large"]) .input {
          padding: 0.75rem 1rem;
          font-size: 1rem;
        }
      }
    `;
  }

  private updateValue(value: string) {
    this.props.value = value;
    this.inputElement.value = value;
    
    // Update clear button visibility
    if (this.props.clearable) {
      if (value) {
        this.inputWrapper.classList.add('has-value');
      } else {
        this.inputWrapper.classList.remove('has-value');
      }
    }
  }

  private validateInput() {
    const value = this.inputElement.value;
    let isValid = true;

    // Required validation
    if (this.props.required && !value) {
      isValid = false;
    }

    // Pattern validation
    if (this.props.pattern && value) {
      const regex = new RegExp(this.props.pattern);
      isValid = regex.test(value);
    }

    // Length validation
    if (this.props.minLength && value.length < this.props.minLength) {
      isValid = false;
    }

    if (this.props.maxLength && value.length > this.props.maxLength) {
      isValid = false;
    }

    // Built-in HTML5 validation
    isValid = isValid && this.inputElement.validity.valid;

    if (isValid) {
      this.removeAttribute('invalid');
    } else {
      this.setAttribute('invalid', '');
    }

    return isValid;
  }

  private createLabel() {
    if (this.props.label && !this.labelElement) {
      this.labelElement = document.createElement('label');
      this.labelElement.className = 'label';
      if (this.props.required) {
        this.labelElement.classList.add('required');
      }
      this.labelElement.textContent = this.props.label;
      this.container.insertBefore(this.labelElement, this.inputWrapper);
    } else if (!this.props.label && this.labelElement) {
      this.labelElement.remove();
      this.labelElement = null;
    }
  }

  private createHelpText() {
    if (this.props.helpText && !this.helpTextElement) {
      this.helpTextElement = document.createElement('div');
      this.helpTextElement.className = 'help-text';
      this.helpTextElement.textContent = this.props.helpText;
      this.container.appendChild(this.helpTextElement);
    } else if (!this.props.helpText && this.helpTextElement) {
      this.helpTextElement.remove();
      this.helpTextElement = null;
    }
  }

  private createErrorMessage() {
    if (this.props.errorMessage && !this.errorElement) {
      this.errorElement = document.createElement('div');
      this.errorElement.className = 'error-message';
      this.errorElement.textContent = this.props.errorMessage;
      this.container.appendChild(this.errorElement);
    } else if (!this.props.errorMessage && this.errorElement) {
      this.errorElement.remove();
      this.errorElement = null;
    }
  }

  private createIcon() {
    // Remove existing icons
    const existingIcons = this.inputWrapper.querySelectorAll('.icon');
    existingIcons.forEach(icon => icon.remove());

    if (this.props.icon) {
      const iconElement = document.createElement('div');
      iconElement.className = `icon icon-${this.props.iconPosition || 'left'}`;
      iconElement.innerHTML = this.props.icon;
      this.inputWrapper.appendChild(iconElement);
    }
  }

  private createClearButton() {
    let clearButton = this.inputWrapper.querySelector('.clear-button');
    
    if (this.props.clearable && !clearButton) {
      clearButton = document.createElement('button');
      clearButton.className = 'clear-button';
      clearButton.innerHTML = '×';
      (clearButton as HTMLButtonElement).type = 'button';
      clearButton.addEventListener('click', () => {
        this.updateValue('');
        this.dispatchEvent(new CustomEvent('clear'));
        this.inputElement.focus();
      });
      this.inputWrapper.appendChild(clearButton);
    } else if (!this.props.clearable && clearButton) {
      clearButton.remove();
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateProps();
      this.updateComponent();
    }
  }

  private updateProps() {
    this.props = {
      type: (this.getAttribute('type') as InputProps['type']) || 'text',
      size: (this.getAttribute('size') as InputProps['size']) || 'medium',
      variant: (this.getAttribute('variant') as InputProps['variant']) || 'default',
      disabled: this.hasAttribute('disabled'),
      readonly: this.hasAttribute('readonly'),
      required: this.hasAttribute('required'),
      invalid: this.hasAttribute('invalid'),
      placeholder: this.getAttribute('placeholder') || undefined,
      value: this.getAttribute('value') || '',
      label: this.getAttribute('label') || undefined,
      helpText: this.getAttribute('help-text') || undefined,
      errorMessage: this.getAttribute('error-message') || undefined,
      icon: this.getAttribute('icon') || undefined,
      iconPosition: (this.getAttribute('icon-position') as InputProps['iconPosition']) || 'left',
      clearable: this.hasAttribute('clearable'),
      maxLength: this.getAttribute('maxlength') ? parseInt(this.getAttribute('maxlength')!) : undefined,
      minLength: this.getAttribute('minlength') ? parseInt(this.getAttribute('minlength')!) : undefined,
      pattern: this.getAttribute('pattern') || undefined,
    };
  }

  private updateComponent() {
    // Update input attributes
    this.inputElement.type = this.props.type!;
    this.inputElement.disabled = this.props.disabled || false;
    this.inputElement.readOnly = this.props.readonly || false;
    this.inputElement.required = this.props.required || false;
    this.inputElement.placeholder = this.props.placeholder || '';
    this.inputElement.value = this.props.value || '';
    
    if (this.props.maxLength) {
      this.inputElement.maxLength = this.props.maxLength;
    }
    
    if (this.props.pattern) {
      this.inputElement.pattern = this.props.pattern;
    }

    // Update other elements
    this.createLabel();
    this.createHelpText();
    this.createErrorMessage();
    this.createIcon();
    this.createClearButton();

    // Append input to wrapper if not already there
    if (!this.inputWrapper.contains(this.inputElement)) {
      this.inputWrapper.appendChild(this.inputElement);
    }

    // Append wrapper to container if not already there
    if (!this.container.contains(this.inputWrapper)) {
      this.container.appendChild(this.inputWrapper);
    }
  }

  connectedCallback() {
    this.updateProps();
    this.updateComponent();
  }

  // Public API
  public override focus() {
    this.inputElement.focus();
  }

  public override blur() {
    this.inputElement.blur();
  }

  public getValue(): string {
    return this.inputElement.value;
  }

  public setValue(value: string) {
    this.updateValue(value);
    this.setAttribute('value', value);
  }

  public validate(): boolean {
    return this.validateInput();
  }

  public clear() {
    this.updateValue('');
  }
}

// Register the custom element
customElements.define('ui-input', Input);

export { Input as UIInput };