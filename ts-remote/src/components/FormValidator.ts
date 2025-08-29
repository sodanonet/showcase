import { BaseWebComponent } from '../base/BaseWebComponent';
import { Component, ObservedAttributes } from '../decorators/Component';

interface ValidationRule {
  name: string;
  validator: (value: string) => boolean;
  message: string;
}

interface FormField {
  name: string;
  value: string;
  rules: ValidationRule[];
  touched: boolean;
  valid: boolean;
  errors: string[];
}

interface FormState {
  fields: Map<string, FormField>;
  isValid: boolean;
  isSubmitted: boolean;
  touchedFields: Set<string>;
}

@Component('ts-form-validator')
@ObservedAttributes(['theme', 'strict-mode'])
export class FormValidator extends BaseWebComponent {
  private state: FormState = {
    fields: new Map(),
    isValid: false,
    isSubmitted: false,
    touchedFields: new Set()
  };

  private validationRules: Record<string, ValidationRule[]> = {
    email: [
      {
        name: 'required',
        validator: (value: string) => value.trim().length > 0,
        message: 'Email is required'
      },
      {
        name: 'email',
        validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
      },
      {
        name: 'length',
        validator: (value: string) => value.length <= 100,
        message: 'Email must be less than 100 characters'
      }
    ],
    password: [
      {
        name: 'required',
        validator: (value: string) => value.trim().length > 0,
        message: 'Password is required'
      },
      {
        name: 'minLength',
        validator: (value: string) => value.length >= 8,
        message: 'Password must be at least 8 characters long'
      },
      {
        name: 'uppercase',
        validator: (value: string) => /[A-Z]/.test(value),
        message: 'Password must contain at least one uppercase letter'
      },
      {
        name: 'lowercase',
        validator: (value: string) => /[a-z]/.test(value),
        message: 'Password must contain at least one lowercase letter'
      },
      {
        name: 'number',
        validator: (value: string) => /\d/.test(value),
        message: 'Password must contain at least one number'
      },
      {
        name: 'special',
        validator: (value: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
        message: 'Password must contain at least one special character'
      }
    ],
    confirmPassword: [
      {
        name: 'required',
        validator: (value: string) => value.trim().length > 0,
        message: 'Please confirm your password'
      },
      {
        name: 'match',
        validator: (value: string) => {
          const passwordField = this.state.fields.get('password');
          return passwordField ? value === passwordField.value : false;
        },
        message: 'Passwords do not match'
      }
    ],
    firstName: [
      {
        name: 'required',
        validator: (value: string) => value.trim().length > 0,
        message: 'First name is required'
      },
      {
        name: 'minLength',
        validator: (value: string) => value.trim().length >= 2,
        message: 'First name must be at least 2 characters'
      },
      {
        name: 'alpha',
        validator: (value: string) => /^[a-zA-Z\s]+$/.test(value),
        message: 'First name can only contain letters and spaces'
      }
    ],
    lastName: [
      {
        name: 'required',
        validator: (value: string) => value.trim().length > 0,
        message: 'Last name is required'
      },
      {
        name: 'minLength',
        validator: (value: string) => value.trim().length >= 2,
        message: 'Last name must be at least 2 characters'
      },
      {
        name: 'alpha',
        validator: (value: string) => /^[a-zA-Z\s]+$/.test(value),
        message: 'Last name can only contain letters and spaces'
      }
    ],
    phone: [
      {
        name: 'phone',
        validator: (value: string) => /^\+?[\d\s\-\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
        message: 'Please enter a valid phone number'
      }
    ],
    age: [
      {
        name: 'number',
        validator: (value: string) => /^\d+$/.test(value),
        message: 'Age must be a number'
      },
      {
        name: 'range',
        validator: (value: string) => {
          const num = parseInt(value);
          return num >= 18 && num <= 100;
        },
        message: 'Age must be between 18 and 100'
      }
    ]
  };

  static get observedAttributes(): string[] {
    return ['theme', 'strict-mode'];
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initializeFields();
  }

  private initializeFields(): void {
    Object.keys(this.validationRules).forEach(fieldName => {
      this.state.fields.set(fieldName, {
        name: fieldName,
        value: '',
        rules: this.validationRules[fieldName],
        touched: false,
        valid: false,
        errors: []
      });
    });
  }

  protected getTemplate(): string {
    const isStrictMode = this.getBooleanAttribute('strict-mode');

    return `
      <div class="form-container">
        <h3>Advanced Form Validation</h3>
        <p class="form-description">
          TypeScript-powered form validation with real-time feedback and comprehensive rule checking.
        </p>

        <div class="form-modes">
          <label class="mode-toggle">
            <input type="checkbox" ${isStrictMode ? 'checked' : ''} data-mode="strict">
            <span class="toggle-slider"></span>
            <span class="toggle-label">Strict Mode</span>
          </label>
        </div>

        <form class="validation-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                value="${this.getFieldValue('firstName')}"
                class="${this.getFieldClass('firstName')}"
                placeholder="Enter your first name"
              >
              <div class="field-feedback">
                ${this.renderFieldErrors('firstName')}
                ${this.renderFieldSuccess('firstName')}
              </div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                value="${this.getFieldValue('lastName')}"
                class="${this.getFieldClass('lastName')}"
                placeholder="Enter your last name"
              >
              <div class="field-feedback">
                ${this.renderFieldErrors('lastName')}
                ${this.renderFieldSuccess('lastName')}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value="${this.getFieldValue('email')}"
              class="${this.getFieldClass('email')}"
              placeholder="Enter your email address"
            >
            <div class="field-feedback">
              ${this.renderFieldErrors('email')}
              ${this.renderFieldSuccess('email')}
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password *</label>
            <div class="password-field">
              <input 
                type="password" 
                id="password" 
                name="password" 
                value="${this.getFieldValue('password')}"
                class="${this.getFieldClass('password')}"
                placeholder="Enter your password"
              >
              <button type="button" class="password-toggle" data-action="toggle-password">👁️</button>
            </div>
            <div class="password-strength">
              ${this.renderPasswordStrength()}
            </div>
            <div class="field-feedback">
              ${this.renderFieldErrors('password')}
              ${this.renderFieldSuccess('password')}
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value="${this.getFieldValue('confirmPassword')}"
              class="${this.getFieldClass('confirmPassword')}"
              placeholder="Confirm your password"
            >
            <div class="field-feedback">
              ${this.renderFieldErrors('confirmPassword')}
              ${this.renderFieldSuccess('confirmPassword')}
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value="${this.getFieldValue('phone')}"
                class="${this.getFieldClass('phone')}"
                placeholder="+1 (555) 123-4567"
              >
              <div class="field-feedback">
                ${this.renderFieldErrors('phone')}
                ${this.renderFieldSuccess('phone')}
              </div>
            </div>

            <div class="form-group">
              <label for="age">Age</label>
              <input 
                type="number" 
                id="age" 
                name="age" 
                value="${this.getFieldValue('age')}"
                class="${this.getFieldClass('age')}"
                placeholder="25"
                min="18"
                max="100"
              >
              <div class="field-feedback">
                ${this.renderFieldErrors('age')}
                ${this.renderFieldSuccess('age')}
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" data-action="reset">🔄 Reset Form</button>
            <button type="button" class="btn btn-primary" data-action="validate" ${!this.state.isValid ? 'disabled' : ''}>
              ✅ Validate All
            </button>
            <button type="submit" class="btn btn-success" ${!this.state.isValid ? 'disabled' : ''}>
              🚀 Submit Form
            </button>
          </div>
        </form>

        <div class="validation-summary">
          <h4>Validation Summary</h4>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">Fields Valid:</span>
              <span class="stat-value">${this.getValidFieldCount()} / ${this.getTotalFieldCount()}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Form Status:</span>
              <span class="stat-value ${this.state.isValid ? 'valid' : 'invalid'}">
                ${this.state.isValid ? '✅ Valid' : '❌ Invalid'}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Submission Attempts:</span>
              <span class="stat-value">${this.state.isSubmitted ? '1+' : '0'}</span>
            </div>
          </div>

          ${this.renderValidationDetails()}
        </div>
      </div>
    `;
  }

  private getFieldValue(fieldName: string): string {
    return this.state.fields.get(fieldName)?.value || '';
  }

  private getFieldClass(fieldName: string): string {
    const field = this.state.fields.get(fieldName);
    if (!field || !field.touched) return '';
    
    return field.valid ? 'valid' : 'invalid';
  }

  private renderFieldErrors(fieldName: string): string {
    const field = this.state.fields.get(fieldName);
    if (!field || !field.touched || field.valid) return '';

    return field.errors.map(error => 
      `<div class="error-message">❌ ${error}</div>`
    ).join('');
  }

  private renderFieldSuccess(fieldName: string): string {
    const field = this.state.fields.get(fieldName);
    if (!field || !field.touched || !field.valid) return '';

    return '<div class="success-message">✅ Valid</div>';
  }

  private renderPasswordStrength(): string {
    const password = this.getFieldValue('password');
    if (!password) return '';

    let strength = 0;
    let strengthLabel = 'Very Weak';
    let strengthClass = 'very-weak';

    // Calculate strength
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 1;
    if (password.length >= 12) strength += 1;

    switch (strength) {
      case 0:
      case 1:
        strengthLabel = 'Very Weak';
        strengthClass = 'very-weak';
        break;
      case 2:
        strengthLabel = 'Weak';
        strengthClass = 'weak';
        break;
      case 3:
        strengthLabel = 'Fair';
        strengthClass = 'fair';
        break;
      case 4:
        strengthLabel = 'Good';
        strengthClass = 'good';
        break;
      case 5:
      case 6:
        strengthLabel = 'Strong';
        strengthClass = 'strong';
        break;
    }

    return `
      <div class="strength-indicator">
        <div class="strength-bar">
          <div class="strength-fill ${strengthClass}" style="width: ${(strength / 6) * 100}%"></div>
        </div>
        <span class="strength-label ${strengthClass}">Password Strength: ${strengthLabel}</span>
      </div>
    `;
  }

  private getValidFieldCount(): number {
    return Array.from(this.state.fields.values()).filter(field => field.valid).length;
  }

  private getTotalFieldCount(): number {
    return this.state.fields.size;
  }

  private renderValidationDetails(): string {
    const invalidFields = Array.from(this.state.fields.values()).filter(field => !field.valid && field.touched);
    
    if (invalidFields.length === 0) {
      return '<div class="validation-success">🎉 All validations passed! Form is ready for submission.</div>';
    }

    return `
      <div class="validation-errors">
        <h5>Issues to resolve:</h5>
        <ul class="error-list">
          ${invalidFields.map(field => `
            <li class="error-item">
              <strong>${this.formatFieldName(field.name)}:</strong>
              <ul>
                ${field.errors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  protected getStyles(): string {
    return `
      :host {
        display: block;
        width: 100%;
      }

      .form-container {
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

      .form-description {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 24px 0;
        line-height: 1.5;
      }

      .form-modes {
        margin-bottom: 24px;
      }

      .mode-toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.9);
      }

      .mode-toggle input[type="checkbox"] {
        display: none;
      }

      .toggle-slider {
        width: 50px;
        height: 24px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        position: relative;
        transition: background 0.3s ease;
      }

      .toggle-slider::before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.3s ease;
      }

      .mode-toggle input[type="checkbox"]:checked + .toggle-slider {
        background: #667eea;
      }

      .mode-toggle input[type="checkbox"]:checked + .toggle-slider::before {
        transform: translateX(26px);
      }

      .validation-form {
        margin-bottom: 30px;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
      }

      .form-group input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-size: 1rem;
        transition: all 0.3s ease;
        box-sizing: border-box;
      }

      .form-group input:focus {
        outline: none;
        border-color: #667eea;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-group input.valid {
        border-color: #27ae60;
        background: rgba(39, 174, 96, 0.1);
      }

      .form-group input.invalid {
        border-color: #e74c3c;
        background: rgba(231, 76, 60, 0.1);
      }

      .password-field {
        position: relative;
      }

      .password-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        padding: 4px;
      }

      .password-toggle:hover {
        color: rgba(255, 255, 255, 0.9);
      }

      .password-strength {
        margin-top: 8px;
      }

      .strength-indicator {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .strength-bar {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
        overflow: hidden;
      }

      .strength-fill {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 3px;
      }

      .strength-fill.very-weak { background: #e74c3c; }
      .strength-fill.weak { background: #f39c12; }
      .strength-fill.fair { background: #f1c40f; }
      .strength-fill.good { background: #3498db; }
      .strength-fill.strong { background: #27ae60; }

      .strength-label {
        font-size: 0.8rem;
        font-weight: 500;
        min-width: 140px;
      }

      .strength-label.very-weak { color: #e74c3c; }
      .strength-label.weak { color: #f39c12; }
      .strength-label.fair { color: #f1c40f; }
      .strength-label.good { color: #3498db; }
      .strength-label.strong { color: #27ae60; }

      .field-feedback {
        margin-top: 8px;
        min-height: 24px;
      }

      .error-message {
        color: #e74c3c;
        font-size: 0.85rem;
        margin-bottom: 4px;
      }

      .success-message {
        color: #27ae60;
        font-size: 0.85rem;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 30px;
        flex-wrap: wrap;
      }

      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .btn-success {
        background: linear-gradient(135deg, #27ae60, #229954);
        color: white;
      }

      .btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }

      .validation-summary {
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .validation-summary h4 {
        color: #fff;
        margin: 0 0 16px 0;
        font-size: 1.1rem;
      }

      .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .stat-label {
        color: rgba(255, 255, 255, 0.7);
      }

      .stat-value {
        font-weight: 600;
        color: #667eea;
      }

      .stat-value.valid {
        color: #27ae60;
      }

      .stat-value.invalid {
        color: #e74c3c;
      }

      .validation-success {
        background: rgba(39, 174, 96, 0.1);
        color: #27ae60;
        padding: 12px;
        border-radius: 6px;
        border-left: 4px solid #27ae60;
        text-align: center;
      }

      .validation-errors h5 {
        color: #e74c3c;
        margin: 0 0 12px 0;
        font-size: 1rem;
      }

      .error-list {
        margin: 0;
        padding-left: 20px;
        color: rgba(255, 255, 255, 0.9);
      }

      .error-item {
        margin-bottom: 12px;
      }

      .error-item ul {
        margin-top: 4px;
        color: #e74c3c;
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }
        
        .form-actions {
          flex-direction: column;
          align-items: center;
        }
        
        .btn {
          width: 100%;
          max-width: 300px;
        }
        
        .summary-stats {
          grid-template-columns: 1fr;
        }
        
        .strength-indicator {
          flex-direction: column;
          gap: 8px;
        }
        
        .strength-label {
          min-width: auto;
          text-align: center;
        }
      }
    `;
  }

  protected setupEventListeners(): void {
    this.shadow.addEventListener('input', this.handleInput.bind(this));
    this.shadow.addEventListener('blur', this.handleBlur.bind(this), true);
    this.shadow.addEventListener('click', this.handleClick.bind(this));
    this.shadow.addEventListener('submit', this.handleSubmit.bind(this));
    this.shadow.addEventListener('change', this.handleChange.bind(this));
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.tagName === 'INPUT') {
      this.updateFieldValue(target.name, target.value);
      this.validateField(target.name);
    }
  }

  private handleBlur(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.tagName === 'INPUT') {
      this.state.touchedFields.add(target.name);
      this.markFieldTouched(target.name);
      this.validateField(target.name);
    }
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const action = target.getAttribute('data-action');

    if (action) {
      event.preventDefault();
      this.handleAction(action);
    }
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    this.state.isSubmitted = true;
    this.validateAllFields();
    
    if (this.state.isValid) {
      this.emit('formSubmit', this.getFormData());
    } else {
      this.emit('formError', { errors: this.getAllErrors() });
    }
  }

  private handleChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.type === 'checkbox' && target.getAttribute('data-mode') === 'strict') {
      this.setAttribute('strict-mode', target.checked.toString());
    }
  }

  private updateFieldValue(fieldName: string, value: string): void {
    const field = this.state.fields.get(fieldName);
    if (field) {
      field.value = value;
      this.state.fields.set(fieldName, field);
    }
  }

  private markFieldTouched(fieldName: string): void {
    const field = this.state.fields.get(fieldName);
    if (field) {
      field.touched = true;
      this.state.fields.set(fieldName, field);
    }
  }

  private validateField(fieldName: string): void {
    const field = this.state.fields.get(fieldName);
    if (!field) return;

    field.errors = [];
    field.valid = true;

    const isStrictMode = this.getBooleanAttribute('strict-mode');
    const isRequired = field.rules.some(rule => rule.name === 'required');

    // Skip validation for optional fields in non-strict mode if empty
    if (!isStrictMode && !isRequired && !field.value.trim()) {
      field.valid = true;
      this.state.fields.set(fieldName, field);
      this.updateFormValidity();
      this.render();
      return;
    }

    for (const rule of field.rules) {
      if (!rule.validator(field.value)) {
        field.errors.push(rule.message);
        field.valid = false;
      }
    }

    this.state.fields.set(fieldName, field);
    this.updateFormValidity();
    this.render();
  }

  private validateAllFields(): void {
    this.state.fields.forEach((field, fieldName) => {
      field.touched = true;
      this.validateField(fieldName);
    });
  }

  private updateFormValidity(): void {
    const isStrictMode = this.getBooleanAttribute('strict-mode');
    
    this.state.isValid = Array.from(this.state.fields.values()).every(field => {
      if (!isStrictMode) {
        // In non-strict mode, optional empty fields are valid
        const isRequired = field.rules.some(rule => rule.name === 'required');
        if (!isRequired && !field.value.trim()) {
          return true;
        }
      }
      return field.valid;
    });
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'reset':
        this.resetForm();
        break;
      case 'validate':
        this.validateAllFields();
        break;
      case 'toggle-password':
        this.togglePasswordVisibility();
        break;
    }
  }

  private resetForm(): void {
    this.state.fields.forEach((field, fieldName) => {
      field.value = '';
      field.touched = false;
      field.valid = false;
      field.errors = [];
      this.state.fields.set(fieldName, field);
    });
    
    this.state.isValid = false;
    this.state.isSubmitted = false;
    this.state.touchedFields.clear();
    
    this.render();
    this.emit('formReset', {});
  }

  private togglePasswordVisibility(): void {
    const passwordInput = this.$('#password') as HTMLInputElement;
    const confirmPasswordInput = this.$('#confirmPassword') as HTMLInputElement;
    
    if (passwordInput && confirmPasswordInput) {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      confirmPasswordInput.type = isPassword ? 'text' : 'password';
      
      const toggleButton = this.$('.password-toggle');
      if (toggleButton) {
        toggleButton.textContent = isPassword ? '🙈' : '👁️';
      }
    }
  }

  private getFormDataInternal(): Record<string, string> {
    const data: Record<string, string> = {};
    this.state.fields.forEach((field, fieldName) => {
      data[fieldName] = field.value;
    });
    return data;
  }

  private getAllErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    this.state.fields.forEach((field, fieldName) => {
      if (field.errors.length > 0) {
        errors[fieldName] = field.errors;
      }
    });
    return errors;
  }

  protected onAttributeChanged(name: string, oldValue: string, newValue: string): void {
    if (name === 'strict-mode') {
      this.validateAllFields();
    }
  }

  // Public API methods
  public getFormValidity(): boolean {
    return this.state.isValid;
  }

  public getFormData(): Readonly<Record<string, string>> {
    return this.getFormDataInternal();
  }

  public getFieldErrors(fieldName: string): string[] {
    return this.state.fields.get(fieldName)?.errors || [];
  }

  public validateForm(): boolean {
    this.validateAllFields();
    return this.state.isValid;
  }

  public resetFormPublic(): void {
    this.resetForm();
  }
}