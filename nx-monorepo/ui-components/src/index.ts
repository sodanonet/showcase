// Export all components
export * from './lib/button/button';
export * from './lib/card/card';
export * from './lib/input/input';
export * from './lib/modal/modal';

// Re-export default function for backward compatibility
export function uiComponents(): string {
  return 'ui-components';
}

// Component registration utility
export function registerAllComponents(): void {
  // Components are automatically registered via their static constructors
  // This function can be called to ensure all components are loaded
  import('./lib/button/button');
  import('./lib/card/card');
  import('./lib/input/input');
  import('./lib/modal/modal');
}

// Component manifest for documentation
export const COMPONENT_MANIFEST = {
  'ui-button': {
    name: 'Button',
    description: 'A versatile button component with multiple variants, sizes, and states',
    category: 'Form Controls',
    props: [
      { name: 'variant', type: 'string', default: 'primary', options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'] },
      { name: 'size', type: 'string', default: 'medium', options: ['small', 'medium', 'large'] },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'full-width', type: 'boolean', default: false },
      { name: 'rounded', type: 'boolean', default: false },
      { name: 'outline', type: 'boolean', default: false },
    ],
    events: ['button-click'],
    slots: ['default']
  },
  'ui-card': {
    name: 'Card',
    description: 'A flexible card container with header, content, and footer sections',
    category: 'Layout',
    props: [
      { name: 'variant', type: 'string', default: 'default', options: ['default', 'elevated', 'outlined', 'filled'] },
      { name: 'padding', type: 'string', default: 'medium', options: ['none', 'small', 'medium', 'large'] },
      { name: 'rounded', type: 'boolean', default: false },
      { name: 'hoverable', type: 'boolean', default: false },
      { name: 'clickable', type: 'boolean', default: false },
      { name: 'loading', type: 'boolean', default: false },
    ],
    events: ['card-click'],
    slots: ['default', 'header', 'footer']
  },
  'ui-input': {
    name: 'Input',
    description: 'A comprehensive input field with validation, icons, and multiple variants',
    category: 'Form Controls',
    props: [
      { name: 'type', type: 'string', default: 'text', options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
      { name: 'size', type: 'string', default: 'medium', options: ['small', 'medium', 'large'] },
      { name: 'variant', type: 'string', default: 'default', options: ['default', 'filled', 'outlined', 'underlined'] },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'required', type: 'boolean', default: false },
      { name: 'invalid', type: 'boolean', default: false },
      { name: 'clearable', type: 'boolean', default: false },
    ],
    events: ['input', 'change', 'focus', 'blur', 'clear'],
    slots: []
  },
  'ui-modal': {
    name: 'Modal',
    description: 'A modal dialog with customizable size, animations, and backdrop options',
    category: 'Overlay',
    props: [
      { name: 'open', type: 'boolean', default: false },
      { name: 'size', type: 'string', default: 'medium', options: ['small', 'medium', 'large', 'fullscreen'] },
      { name: 'closable', type: 'boolean', default: false },
      { name: 'close-on-backdrop', type: 'boolean', default: false },
      { name: 'close-on-escape', type: 'boolean', default: false },
      { name: 'animation', type: 'string', default: 'fade', options: ['fade', 'scale', 'slide-up', 'slide-down'] },
      { name: 'backdrop', type: 'string', default: 'default', options: ['default', 'blur', 'dark'] },
      { name: 'persistent', type: 'boolean', default: false },
    ],
    events: ['modal-opened', 'modal-closed', 'close'],
    slots: ['default', 'footer']
  }
};

// Utility functions for component documentation
export function getComponentList(): string[] {
  return Object.keys(COMPONENT_MANIFEST);
}

export function getComponentInfo(componentName: string) {
  return COMPONENT_MANIFEST[componentName as keyof typeof COMPONENT_MANIFEST];
}

export function getAllComponentsInfo() {
  return COMPONENT_MANIFEST;
}
