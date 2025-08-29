/**
 * Base class for all Web Components
 * Provides common functionality and TypeScript decorators
 */
export abstract class BaseWebComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  private _isConnected: boolean = false;
  
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }
  
  /**
   * Called when element is added to the DOM
   */
  connectedCallback(): void {
    this._isConnected = true;
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Called when element is removed from the DOM
   */
  disconnectedCallback(): void {
    this._isConnected = false;
    this.cleanup();
  }
  
  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue !== newValue && this._isConnected) {
      this.onAttributeChanged(name, oldValue, newValue);
      this.render();
    }
  }
  
  /**
   * Override this method to define component template
   */
  protected abstract getTemplate(): string;
  
  /**
   * Override this method to define component styles
   */
  protected abstract getStyles(): string;
  
  /**
   * Override this method to handle attribute changes
   */
  protected onAttributeChanged(name: string, oldValue: string, newValue: string): void {
    // Default implementation does nothing
  }
  
  /**
   * Override this method to setup event listeners
   */
  protected setupEventListeners(): void {
    // Default implementation does nothing
  }
  
  /**
   * Override this method to cleanup resources
   */
  protected cleanup(): void {
    // Default implementation does nothing
  }
  
  /**
   * Render the component
   */
  protected render(): void {
    this.shadow.innerHTML = `
      <style>${this.getStyles()}</style>
      ${this.getTemplate()}
    `;
  }
  
  /**
   * Query selector within shadow DOM
   */
  protected $(selector: string): Element | null {
    return this.shadow.querySelector(selector);
  }
  
  /**
   * Query selector all within shadow DOM
   */
  protected $$(selector: string): NodeListOf<Element> {
    return this.shadow.querySelectorAll(selector);
  }
  
  /**
   * Emit custom event
   */
  protected emit(eventName: string, detail?: any): void {
    this.dispatchEvent(new CustomEvent(eventName, { 
      detail, 
      bubbles: true, 
      composed: true 
    }));
  }
  
  /**
   * Get attribute as boolean
   */
  protected getBooleanAttribute(name: string): boolean {
    return this.hasAttribute(name);
  }
  
  /**
   * Get attribute as number
   */
  protected getNumberAttribute(name: string, defaultValue: number = 0): number {
    const value = this.getAttribute(name);
    return value ? parseFloat(value) || defaultValue : defaultValue;
  }
}