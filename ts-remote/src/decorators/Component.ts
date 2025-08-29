/**
 * Component decorator for Web Components
 * Automatically registers the component with the custom elements registry
 */
export function Component(selector: string) {
  return function <T extends CustomElementConstructor>(constructor: T) {
    // Register the custom element
    if (!customElements.get(selector)) {
      customElements.define(selector, constructor);
    }
    
    return constructor;
  };
}

/**
 * ObservedAttributes decorator
 * Defines which attributes should trigger attributeChangedCallback
 */
export function ObservedAttributes(attributes: string[]) {
  return function <T extends CustomElementConstructor>(constructor: T) {
    (constructor as any).observedAttributes = attributes;
    return constructor;
  };
}