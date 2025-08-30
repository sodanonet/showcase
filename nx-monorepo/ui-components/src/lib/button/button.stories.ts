import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './button';

const meta: Meta = {
  title: 'Components/Button',
  component: 'ui-button',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Built with Web Components for maximum compatibility across frameworks.'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'],
      description: 'The visual style variant of the button'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'The size of the button'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled'
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the button shows a loading state'
    },
    'full-width': {
      control: { type: 'boolean' },
      description: 'Whether the button takes the full width of its container'
    },
    rounded: {
      control: { type: 'boolean' },
      description: 'Whether the button has rounded corners'
    },
    outline: {
      control: { type: 'boolean' },
      description: 'Whether the button uses outline style'
    },
    icon: {
      control: { type: 'text' },
      description: 'Icon to display in the button (HTML content)'
    },
    'icon-position': {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of the icon relative to text'
    }
  },
  args: {
    variant: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    'full-width': false,
    rounded: false,
    outline: false,
    'icon-position': 'left'
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: (args) => html`
    <ui-button
      variant="${args.variant}"
      size="${args.size}"
      ?disabled="${args.disabled}"
      ?loading="${args.loading}"
      ?full-width="${args['full-width']}"
      ?rounded="${args.rounded}"
      ?outline="${args.outline}"
      icon="${args.icon || ''}"
      icon-position="${args['icon-position']}"
    >
      Click me
    </ui-button>
  `
};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button variant="primary">Primary</ui-button>
      <ui-button variant="secondary">Secondary</ui-button>
      <ui-button variant="success">Success</ui-button>
      <ui-button variant="danger">Danger</ui-button>
      <ui-button variant="warning">Warning</ui-button>
      <ui-button variant="info">Info</ui-button>
      <ui-button variant="light">Light</ui-button>
      <ui-button variant="dark">Dark</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different color variants of the button component.'
      }
    }
  }
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center;">
      <ui-button size="small">Small</ui-button>
      <ui-button size="medium">Medium</ui-button>
      <ui-button size="large">Large</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of the button component.'
      }
    }
  }
};

export const Outline: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button variant="primary" outline>Primary Outline</ui-button>
      <ui-button variant="secondary" outline>Secondary Outline</ui-button>
      <ui-button variant="success" outline>Success Outline</ui-button>
      <ui-button variant="danger" outline>Danger Outline</ui-button>
      <ui-button variant="warning" outline>Warning Outline</ui-button>
      <ui-button variant="info" outline>Info Outline</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Outline style variants with transparent backgrounds.'
      }
    }
  }
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button>Normal</ui-button>
      <ui-button disabled>Disabled</ui-button>
      <ui-button loading>Loading</ui-button>
      <ui-button rounded>Rounded</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different states and styles of the button component.'
      }
    }
  }
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button icon="→" icon-position="right">Next</ui-button>
      <ui-button icon="←" icon-position="left">Previous</ui-button>
      <ui-button variant="success" icon="✓">Save</ui-button>
      <ui-button variant="danger" icon="×">Delete</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons in different positions.'
      }
    }
  }
};

export const FullWidth: Story = {
  render: () => html`
    <div style="width: 300px;">
      <ui-button full-width variant="primary">Full Width Button</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Button that takes the full width of its container.'
      }
    }
  }
};

export const Interactive: Story = {
  render: () => html`
    <ui-button 
      variant="primary"
      @button-click="${(e: CustomEvent) => {
        console.log('Button clicked!', e.detail);
        alert('Button clicked! Check console for details.');
      }}"
    >
      Click for Event
    </ui-button>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Interactive button that demonstrates the custom event system.'
      }
    }
  }
};

export const LoadingStates: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button loading size="small">Small Loading</ui-button>
      <ui-button loading size="medium">Medium Loading</ui-button>
      <ui-button loading size="large">Large Loading</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Loading states in different sizes.'
      }
    }
  }
};

export const AllCombinations: Story = {
  render: () => html`
    <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      <ui-button variant="primary" size="small">Primary Small</ui-button>
      <ui-button variant="primary" size="medium">Primary Medium</ui-button>
      <ui-button variant="primary" size="large">Primary Large</ui-button>
      <ui-button variant="secondary" outline>Secondary Outline</ui-button>
      <ui-button variant="success" rounded>Success Rounded</ui-button>
      <ui-button variant="danger" icon="×" size="small">Danger Small</ui-button>
      <ui-button variant="info" loading>Info Loading</ui-button>
      <ui-button variant="warning" disabled>Warning Disabled</ui-button>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'A showcase of various button combinations and styles.'
      }
    }
  }
};