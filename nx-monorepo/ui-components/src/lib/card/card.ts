export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  rounded?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  header?: string;
  footer?: string;
}

export class Card extends HTMLElement {
  private props: CardProps = {};
  private cardContainer!: HTMLDivElement;
  private headerElement: HTMLElement | null = null;
  private contentElement!: HTMLElement;
  private footerElement: HTMLElement | null = null;

  static get observedAttributes() {
    return [
      'variant',
      'padding',
      'rounded',
      'hoverable', 
      'clickable',
      'loading',
      'header',
      'footer'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupComponent();
  }

  private setupComponent() {
    this.cardContainer = document.createElement('div');
    this.cardContainer.className = 'card';
    
    // Create header if needed
    this.createHeader();
    
    // Create main content area
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'card-content';
    this.contentElement.innerHTML = '<slot></slot>';
    
    // Create footer if needed
    this.createFooter();
    
    // Add loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
    
    this.cardContainer.appendChild(loadingOverlay);
    
    // Add click handler
    this.cardContainer.addEventListener('click', (e) => {
      if (this.props.clickable && !this.props.loading) {
        this.dispatchEvent(new CustomEvent('card-click', { 
          detail: { originalEvent: e, props: this.props }
        }));
      }
    });

    const style = document.createElement('style');
    style.textContent = this.getStyles();

    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(this.cardContainer);
  }

  private createHeader() {
    if (this.props.header || this.querySelector('[slot="header"]')) {
      if (!this.headerElement) {
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'card-header';
        this.cardContainer.appendChild(this.headerElement);
      }
      
      if (this.props.header) {
        this.headerElement.textContent = this.props.header;
      } else {
        this.headerElement.innerHTML = '<slot name="header"></slot>';
      }
    }
  }

  private createFooter() {
    if (this.props.footer || this.querySelector('[slot="footer"]')) {
      if (!this.footerElement) {
        this.footerElement = document.createElement('div');
        this.footerElement.className = 'card-footer';
        this.cardContainer.appendChild(this.footerElement);
      }
      
      if (this.props.footer) {
        this.footerElement.textContent = this.props.footer;
      } else {
        this.footerElement.innerHTML = '<slot name="footer"></slot>';
      }
    }
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
        --card-border-radius: 8px;
        --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        --card-shadow-hover: 0 4px 8px rgba(0, 0, 0, 0.15);
        --card-background: #ffffff;
        --card-border: 1px solid #e1e5e9;
        --card-transition: all 0.2s ease-in-out;
        --card-padding: 1.5rem;
      }

      .card {
        background-color: var(--card-background);
        border-radius: var(--card-border-radius);
        transition: var(--card-transition);
        position: relative;
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Variant styles */
      :host([variant="default"]) .card {
        border: var(--card-border);
        box-shadow: none;
      }

      :host([variant="elevated"]) .card {
        border: none;
        box-shadow: var(--card-shadow);
      }

      :host([variant="outlined"]) .card {
        border: 2px solid #dee2e6;
        box-shadow: none;
      }

      :host([variant="filled"]) .card {
        background-color: #f8f9fa;
        border: var(--card-border);
        box-shadow: none;
      }

      /* Rounded variant */
      :host([rounded]) .card {
        border-radius: 1rem;
      }

      /* Hoverable effect */
      :host([hoverable]) .card:hover {
        transform: translateY(-2px);
        box-shadow: var(--card-shadow-hover);
      }

      /* Clickable effect */
      :host([clickable]) .card {
        cursor: pointer;
      }

      :host([clickable]) .card:hover {
        transform: translateY(-1px);
        box-shadow: var(--card-shadow-hover);
      }

      :host([clickable]) .card:active {
        transform: translateY(0);
      }

      /* Padding variants */
      :host([padding="none"]) .card-content,
      :host([padding="none"]) .card-header,
      :host([padding="none"]) .card-footer {
        padding: 0;
      }

      :host([padding="small"]) .card-content,
      :host([padding="small"]) .card-header,
      :host([padding="small"]) .card-footer {
        padding: 0.75rem;
      }

      :host(:not([padding])) .card-content,
      :host([padding="medium"]) .card-content,
      :host(:not([padding])) .card-header,
      :host([padding="medium"]) .card-header,
      :host(:not([padding])) .card-footer,
      :host([padding="medium"]) .card-footer {
        padding: var(--card-padding);
      }

      :host([padding="large"]) .card-content,
      :host([padding="large"]) .card-header,
      :host([padding="large"]) .card-footer {
        padding: 2rem;
      }

      .card-header {
        border-bottom: 1px solid #e1e5e9;
        font-weight: 600;
        font-size: 1.125rem;
        color: #2d3748;
        flex-shrink: 0;
      }

      .card-content {
        flex: 1;
        color: #4a5568;
        line-height: 1.6;
      }

      .card-footer {
        border-top: 1px solid #e1e5e9;
        background-color: #f8f9fa;
        flex-shrink: 0;
      }

      /* Loading state */
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.9);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      :host([loading]) .loading-overlay {
        display: flex;
      }

      :host([loading]) .card {
        pointer-events: none;
      }

      .loading-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid #e1e5e9;
        border-top: 3px solid #0066cc;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        :host([padding="large"]) .card-content,
        :host([padding="large"]) .card-header,
        :host([padding="large"]) .card-footer {
          padding: 1rem;
        }
      }

      /* Focus styles for accessibility */
      :host([clickable]) .card:focus-within {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        :host {
          --card-background: #2d3748;
          --card-border: 1px solid #4a5568;
        }

        .card-header {
          color: #e2e8f0;
          border-bottom-color: #4a5568;
        }

        .card-content {
          color: #cbd5e0;
        }

        .card-footer {
          background-color: #1a202c;
          border-top-color: #4a5568;
        }

        :host([variant="filled"]) .card {
          background-color: #1a202c;
        }
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
      variant: (this.getAttribute('variant') as CardProps['variant']) || 'default',
      padding: (this.getAttribute('padding') as CardProps['padding']) || 'medium',
      rounded: this.hasAttribute('rounded'),
      hoverable: this.hasAttribute('hoverable'),
      clickable: this.hasAttribute('clickable'),
      loading: this.hasAttribute('loading'),
      header: this.getAttribute('header') || undefined,
      footer: this.getAttribute('footer') || undefined,
    };
  }

  private updateComponent() {
    // Recreate header and footer if props changed
    if (this.props.header && !this.headerElement) {
      this.createHeader();
    }
    
    if (this.props.footer && !this.footerElement) {
      this.createFooter();
    }

    // Update order of elements
    if (this.headerElement && this.contentElement) {
      this.cardContainer.insertBefore(this.headerElement, this.contentElement);
    }
    
    if (this.footerElement && this.contentElement) {
      this.cardContainer.insertBefore(this.footerElement, this.cardContainer.lastElementChild);
    }
  }

  connectedCallback() {
    this.updateProps();
    this.updateComponent();
  }

  // Public API
  public setLoading(loading: boolean) {
    if (loading) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
  }

  public updateHeader(content: string) {
    this.setAttribute('header', content);
  }

  public updateFooter(content: string) {
    this.setAttribute('footer', content);
  }
}

// Register the custom element
customElements.define('ui-card', Card);

export { Card as UICard };