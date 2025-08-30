export interface ModalProps {
  open?: boolean;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  title?: string;
  subtitle?: string;
  animation?: 'fade' | 'scale' | 'slide-up' | 'slide-down';
  backdrop?: 'default' | 'blur' | 'dark';
  persistent?: boolean;
  zIndex?: number;
}

export class Modal extends HTMLElement {
  private props: ModalProps = {};
  private modalOverlay!: HTMLDivElement;
  private modalContainer!: HTMLDivElement;
  private modalHeader: HTMLElement | null = null;
  private modalContent!: HTMLElement;
  private modalFooter: HTMLElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private isAnimating = false;

  static get observedAttributes() {
    return [
      'open',
      'size',
      'closable',
      'close-on-backdrop',
      'close-on-escape',
      'title',
      'subtitle',
      'animation',
      'backdrop',
      'persistent',
      'z-index'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.setupComponent();
    this.setupEventListeners();
  }

  private setupComponent() {
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.className = 'modal-overlay';
    
    this.modalContainer = document.createElement('div');
    this.modalContainer.className = 'modal-container';
    
    this.modalContent = document.createElement('div');
    this.modalContent.className = 'modal-content';
    this.modalContent.innerHTML = '<slot></slot>';
    
    this.modalContainer.appendChild(this.modalContent);
    this.modalOverlay.appendChild(this.modalContainer);

    const style = document.createElement('style');
    style.textContent = this.getStyles();

    this.shadowRoot!.appendChild(style);
    this.shadowRoot!.appendChild(this.modalOverlay);

    // Initially hide modal
    this.hide();
  }

  private setupEventListeners() {
    // Backdrop click
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay && this.props.closeOnBackdrop && !this.props.persistent) {
        this.close();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.props.open && this.props.closeOnEscape && !this.props.persistent) {
        this.close();
      }
    });

    // Prevent scroll when modal is open
    this.addEventListener('modal-opened', () => {
      document.body.style.overflow = 'hidden';
    });

    this.addEventListener('modal-closed', () => {
      document.body.style.overflow = '';
    });
  }

  private getStyles(): string {
    return `
      :host {
        --modal-z-index: 1000;
        --modal-backdrop: rgba(0, 0, 0, 0.5);
        --modal-backdrop-blur: rgba(0, 0, 0, 0.3);
        --modal-backdrop-dark: rgba(0, 0, 0, 0.8);
        --modal-background: #ffffff;
        --modal-border-radius: 8px;
        --modal-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        --modal-animation-duration: 0.3s;
        --modal-animation-timing: cubic-bezier(0.4, 0, 0.2, 1);
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: var(--modal-z-index);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background-color: var(--modal-backdrop);
        transition: opacity var(--modal-animation-duration) var(--modal-animation-timing),
                    visibility var(--modal-animation-duration) var(--modal-animation-timing);
      }

      .modal-overlay.hidden {
        opacity: 0;
        visibility: hidden;
      }

      .modal-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      /* Backdrop variants */
      :host([backdrop="blur"]) .modal-overlay {
        background-color: var(--modal-backdrop-blur);
        backdrop-filter: blur(4px);
      }

      :host([backdrop="dark"]) .modal-overlay {
        background-color: var(--modal-backdrop-dark);
      }

      .modal-container {
        background-color: var(--modal-background);
        border-radius: var(--modal-border-radius);
        box-shadow: var(--modal-shadow);
        max-height: calc(100vh - 2rem);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
        transform: scale(0.95) translateY(10px);
        transition: transform var(--modal-animation-duration) var(--modal-animation-timing),
                    opacity var(--modal-animation-duration) var(--modal-animation-timing);
        opacity: 0;
      }

      .modal-overlay.visible .modal-container {
        transform: scale(1) translateY(0);
        opacity: 1;
      }

      /* Size variants */
      :host([size="small"]) .modal-container {
        width: 100%;
        max-width: 400px;
      }

      :host([size="medium"]) .modal-container,
      :host(:not([size])) .modal-container {
        width: 100%;
        max-width: 600px;
      }

      :host([size="large"]) .modal-container {
        width: 100%;
        max-width: 900px;
      }

      :host([size="fullscreen"]) .modal-container {
        width: 100vw;
        height: 100vh;
        max-width: none;
        max-height: none;
        border-radius: 0;
        margin: 0;
      }

      :host([size="fullscreen"]) .modal-overlay {
        padding: 0;
      }

      /* Animation variants */
      :host([animation="scale"]) .modal-container {
        transform: scale(0.8);
      }

      :host([animation="scale"]) .modal-overlay.visible .modal-container {
        transform: scale(1);
      }

      :host([animation="slide-up"]) .modal-container {
        transform: translateY(100%);
      }

      :host([animation="slide-up"]) .modal-overlay.visible .modal-container {
        transform: translateY(0);
      }

      :host([animation="slide-down"]) .modal-container {
        transform: translateY(-100%);
      }

      :host([animation="slide-down"]) .modal-overlay.visible .modal-container {
        transform: translateY(0);
      }

      :host([animation="fade"]) .modal-container {
        transform: none;
      }

      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        flex-shrink: 0;
      }

      .modal-title-section {
        flex: 1;
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
        line-height: 1.3;
      }

      .modal-subtitle {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0.25rem 0 0 0;
        line-height: 1.4;
      }

      .modal-close-button {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #9ca3af;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        line-height: 1;
        margin-left: 1rem;
        transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
        flex-shrink: 0;
      }

      .modal-close-button:hover {
        color: #6b7280;
        background-color: #f3f4f6;
      }

      .modal-close-button:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .modal-content {
        padding: 1.5rem;
        flex: 1;
        overflow-y: auto;
        color: #374151;
        line-height: 1.6;
      }

      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e5e7eb;
        background-color: #f9fafb;
        flex-shrink: 0;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .modal-overlay {
          padding: 0;
          align-items: flex-end;
        }

        :host(:not([size="fullscreen"])) .modal-container {
          width: 100%;
          max-width: none;
          border-radius: var(--modal-border-radius) var(--modal-border-radius) 0 0;
          max-height: 90vh;
        }

        :host([animation="slide-up"]) .modal-container {
          transform: translateY(100%);
        }

        .modal-header,
        .modal-content,
        .modal-footer {
          padding: 1rem;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        :host {
          --modal-background: #1f2937;
        }

        .modal-title {
          color: #f9fafb;
        }

        .modal-content {
          color: #d1d5db;
        }

        .modal-header,
        .modal-footer {
          border-color: #374151;
        }

        .modal-footer {
          background-color: #111827;
        }

        .modal-close-button {
          color: #9ca3af;
        }

        .modal-close-button:hover {
          color: #d1d5db;
          background-color: #374151;
        }
      }

      /* Focus trap styles */
      .modal-container:focus {
        outline: none;
      }

      /* Loading state */
      .modal-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem;
      }

      .loading-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid #e5e7eb;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
  }

  private createHeader() {
    if ((this.props.title || this.props.subtitle || this.props.closable) && !this.modalHeader) {
      this.modalHeader = document.createElement('div');
      this.modalHeader.className = 'modal-header';
      
      const titleSection = document.createElement('div');
      titleSection.className = 'modal-title-section';
      
      if (this.props.title) {
        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.textContent = this.props.title;
        titleSection.appendChild(title);
      }
      
      if (this.props.subtitle) {
        const subtitle = document.createElement('p');
        subtitle.className = 'modal-subtitle';
        subtitle.textContent = this.props.subtitle;
        titleSection.appendChild(subtitle);
      }
      
      this.modalHeader.appendChild(titleSection);
      
      if (this.props.closable) {
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'modal-close-button';
        this.closeButton.innerHTML = '×';
        this.closeButton.setAttribute('aria-label', 'Close modal');
        this.closeButton.addEventListener('click', () => this.close());
        this.modalHeader.appendChild(this.closeButton);
      }
      
      this.modalContainer.insertBefore(this.modalHeader, this.modalContent);
    } else if (!this.props.title && !this.props.subtitle && !this.props.closable && this.modalHeader) {
      this.modalHeader.remove();
      this.modalHeader = null;
    }
  }

  private createFooter() {
    const footerSlot = this.querySelector('[slot="footer"]');
    if (footerSlot && !this.modalFooter) {
      this.modalFooter = document.createElement('div');
      this.modalFooter.className = 'modal-footer';
      this.modalFooter.innerHTML = '<slot name="footer"></slot>';
      this.modalContainer.appendChild(this.modalFooter);
    }
  }

  private show() {
    this.modalOverlay.classList.remove('hidden');
    this.modalOverlay.classList.add('visible');
    
    // Focus trap
    this.modalContainer.focus();
    
    this.dispatchEvent(new CustomEvent('modal-opened', { 
      detail: { props: this.props }
    }));
  }

  private hide() {
    this.modalOverlay.classList.remove('visible');
    this.modalOverlay.classList.add('hidden');
    
    this.dispatchEvent(new CustomEvent('modal-closed', { 
      detail: { props: this.props }
    }));
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) {
      this.updateProps();
      this.updateComponent();
    }
  }

  private updateProps() {
    this.props = {
      open: this.hasAttribute('open'),
      size: (this.getAttribute('size') as ModalProps['size']) || 'medium',
      closable: this.hasAttribute('closable'),
      closeOnBackdrop: this.hasAttribute('close-on-backdrop'),
      closeOnEscape: this.hasAttribute('close-on-escape'),
      title: this.getAttribute('title') || undefined,
      subtitle: this.getAttribute('subtitle') || undefined,
      animation: (this.getAttribute('animation') as ModalProps['animation']) || 'fade',
      backdrop: (this.getAttribute('backdrop') as ModalProps['backdrop']) || 'default',
      persistent: this.hasAttribute('persistent'),
      zIndex: this.getAttribute('z-index') ? parseInt(this.getAttribute('z-index')!) : 1000,
    };
  }

  private updateComponent() {
    // Update z-index
    this.modalOverlay.style.zIndex = this.props.zIndex!.toString();
    
    // Show/hide modal
    if (this.props.open) {
      this.show();
    } else {
      this.hide();
    }
    
    // Create/update header and footer
    this.createHeader();
    this.createFooter();
  }

  connectedCallback() {
    this.updateProps();
    this.updateComponent();
  }

  disconnectedCallback() {
    // Restore body scroll
    document.body.style.overflow = '';
  }

  // Public API
  public open() {
    this.setAttribute('open', '');
  }

  public close() {
    if (!this.props.persistent && !this.isAnimating) {
      this.isAnimating = true;
      
      // Wait for animation to complete before removing attribute
      setTimeout(() => {
        this.removeAttribute('open');
        this.isAnimating = false;
        this.dispatchEvent(new CustomEvent('close', { 
          detail: { props: this.props }
        }));
      }, 300);
    }
  }

  public toggle() {
    if (this.props.open) {
      this.close();
    } else {
      this.open();
    }
  }

  public setTitle(title: string) {
    this.setAttribute('title', title);
  }

  public setSubtitle(subtitle: string) {
    this.setAttribute('subtitle', subtitle);
  }
}

// Register the custom element
customElements.define('ui-modal', Modal);

export { Modal as UIModal };