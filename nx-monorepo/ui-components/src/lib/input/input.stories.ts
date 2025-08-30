import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './input';

const meta: Meta = {
  title: 'Components/Input',
  component: 'ui-input',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive input field component with validation, icons, and multiple variants. Supports various input types and provides extensive customization options.'
      }
    }
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The input type'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'The size of the input'
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'filled', 'outlined', 'underlined'],
      description: 'The visual style variant of the input'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled'
    },
    readonly: {
      control: { type: 'boolean' },
      description: 'Whether the input is readonly'
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required'
    },
    invalid: {
      control: { type: 'boolean' },
      description: 'Whether the input is in an invalid state'
    },
    clearable: {
      control: { type: 'boolean' },
      description: 'Whether the input shows a clear button when it has content'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input'
    },
    value: {
      control: { type: 'text' },
      description: 'The current value of the input'
    },
    label: {
      control: { type: 'text' },
      description: 'Label text for the input'
    },
    'help-text': {
      control: { type: 'text' },
      description: 'Help text to display below the input'
    },
    'error-message': {
      control: { type: 'text' },
      description: 'Error message to display when invalid'
    },
    icon: {
      control: { type: 'text' },
      description: 'Icon to display in the input (HTML content)'
    },
    'icon-position': {
      control: { type: 'select' },
      options: ['left', 'right'],
      description: 'Position of the icon'
    },
    maxlength: {
      control: { type: 'number' },
      description: 'Maximum length of input'
    },
    minlength: {
      control: { type: 'number' },
      description: 'Minimum length of input'
    },
    pattern: {
      control: { type: 'text' },
      description: 'Regular expression pattern for validation'
    }
  },
  args: {
    type: 'text',
    size: 'medium',
    variant: 'default',
    disabled: false,
    readonly: false,
    required: false,
    invalid: false,
    clearable: false,
    'icon-position': 'left'
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    placeholder: 'Enter some text...'
  },
  render: (args) => html`
    <div style="width: 300px;">
      <ui-input
        type="${args.type}"
        size="${args.size}"
        variant="${args.variant}"
        ?disabled="${args.disabled}"
        ?readonly="${args.readonly}"
        ?required="${args.required}"
        ?invalid="${args.invalid}"
        ?clearable="${args.clearable}"
        placeholder="${args.placeholder || ''}"
        value="${args.value || ''}"
        label="${args.label || ''}"
        help-text="${args['help-text'] || ''}"
        error-message="${args['error-message'] || ''}"
        icon="${args.icon || ''}"
        icon-position="${args['icon-position']}"
        maxlength="${args.maxlength || ''}"
        minlength="${args.minlength || ''}"
        pattern="${args.pattern || ''}"
      ></ui-input>
    </div>
  `
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input size="small" placeholder="Small input" label="Small Size"></ui-input>
      <ui-input size="medium" placeholder="Medium input" label="Medium Size (Default)"></ui-input>
      <ui-input size="large" placeholder="Large input" label="Large Size"></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of the input component.'
      }
    }
  }
};

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input variant="default" placeholder="Default input" label="Default Variant"></ui-input>
      <ui-input variant="filled" placeholder="Filled input" label="Filled Variant"></ui-input>
      <ui-input variant="outlined" placeholder="Outlined input" label="Outlined Variant"></ui-input>
      <ui-input variant="underlined" placeholder="Underlined input" label="Underlined Variant"></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different visual variants of the input component.'
      }
    }
  }
};

export const InputTypes: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input type="text" placeholder="Enter text" label="Text Input"></ui-input>
      <ui-input type="email" placeholder="Enter email" label="Email Input"></ui-input>
      <ui-input type="password" placeholder="Enter password" label="Password Input"></ui-input>
      <ui-input type="number" placeholder="Enter number" label="Number Input"></ui-input>
      <ui-input type="tel" placeholder="Enter phone number" label="Phone Input"></ui-input>
      <ui-input type="url" placeholder="Enter URL" label="URL Input"></ui-input>
      <ui-input type="search" placeholder="Search..." label="Search Input"></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different input types with their appropriate placeholders and labels.'
      }
    }
  }
};

export const States: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input placeholder="Normal input" label="Normal State"></ui-input>
      <ui-input placeholder="Disabled input" label="Disabled State" disabled></ui-input>
      <ui-input placeholder="Readonly input" label="Readonly State" readonly value="Read-only value"></ui-input>
      <ui-input placeholder="Required input" label="Required State" required></ui-input>
      <ui-input 
        placeholder="Invalid input" 
        label="Invalid State" 
        invalid 
        error-message="This field is required"
        value="Invalid data"
      ></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different states of the input component including disabled, readonly, required, and invalid states.'
      }
    }
  }
};

export const WithIcons: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input 
        placeholder="Search..." 
        label="Search with Icon" 
        icon="🔍" 
        icon-position="left"
      ></ui-input>
      <ui-input 
        placeholder="Enter email" 
        label="Email with Icon" 
        icon="📧" 
        icon-position="left"
        type="email"
      ></ui-input>
      <ui-input 
        placeholder="Enter amount" 
        label="Amount with Currency" 
        icon="$" 
        icon-position="right"
        type="number"
      ></ui-input>
      <ui-input 
        placeholder="Enter password" 
        label="Password with Icon" 
        icon="🔒" 
        icon-position="left"
        type="password"
      ></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Input fields with icons in different positions.'
      }
    }
  }
};

export const WithHelpText: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input 
        placeholder="Enter your username" 
        label="Username" 
        help-text="Must be at least 3 characters long and contain only letters and numbers."
      ></ui-input>
      <ui-input 
        type="password" 
        placeholder="Enter your password" 
        label="Password" 
        help-text="Must contain at least 8 characters, including uppercase, lowercase, and numbers."
      ></ui-input>
      <ui-input 
        type="email" 
        placeholder="Enter your email" 
        label="Email Address" 
        help-text="We'll never share your email with anyone else."
      ></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Input fields with helpful description text.'
      }
    }
  }
};

export const WithValidation: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input 
        placeholder="Enter your name" 
        label="Full Name" 
        required
        minlength="2"
        help-text="Enter your first and last name"
      ></ui-input>
      <ui-input 
        type="email" 
        placeholder="Enter your email" 
        label="Email Address" 
        required
        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
        help-text="Enter a valid email address"
      ></ui-input>
      <ui-input 
        type="password" 
        placeholder="Create a password" 
        label="Password" 
        required
        minlength="8"
        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
        help-text="Must contain at least 8 characters with uppercase, lowercase, and numbers"
      ></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Input fields with validation rules and patterns.'
      }
    }
  }
};

export const ClearableInputs: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 300px;">
      <ui-input 
        placeholder="Type something to see clear button" 
        label="Clearable Text Input" 
        clearable
        value="This text can be cleared"
      ></ui-input>
      <ui-input 
        type="search" 
        placeholder="Search..." 
        label="Clearable Search" 
        clearable
        icon="🔍"
        value="search term"
      ></ui-input>
      <ui-input 
        type="email" 
        placeholder="Enter email" 
        label="Clearable Email" 
        clearable
        value="user@example.com"
      ></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Input fields with clearable functionality. A clear button appears when the input has content.'
      }
    }
  }
};

export const InteractiveExample: Story = {
  render: () => html`
    <div style="width: 300px;">
      <ui-input 
        placeholder="Type something..." 
        label="Interactive Input" 
        help-text="This input demonstrates all events"
        clearable
        @input="${(e: CustomEvent) => {
          console.log('Input event:', e.detail.value);
        }}"
        @change="${(e: CustomEvent) => {
          console.log('Change event:', e.detail.value);
        }}"
        @focus="${(e: CustomEvent) => {
          console.log('Focus event');
        }}"
        @blur="${(e: CustomEvent) => {
          console.log('Blur event');
        }}"
        @clear="${(e: CustomEvent) => {
          console.log('Clear event');
        }}"
      ></ui-input>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Interactive input that demonstrates all available events. Open the browser console to see events as you interact with the input.'
      }
    }
  }
};

export const FormExample: Story = {
  render: () => html`
    <form style="width: 400px; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h3 style="margin-top: 0;">Contact Form</h3>
      
      <div style="margin-bottom: 1rem;">
        <ui-input 
          label="Full Name" 
          placeholder="Enter your full name"
          required
          minlength="2"
        ></ui-input>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <ui-input 
          type="email"
          label="Email Address" 
          placeholder="Enter your email"
          required
          icon="📧"
        ></ui-input>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <ui-input 
          type="tel"
          label="Phone Number" 
          placeholder="Enter your phone number"
          icon="📞"
          help-text="Optional - we'll only call if necessary"
        ></ui-input>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <ui-input 
          label="Company" 
          placeholder="Enter your company name"
          icon="🏢"
        ></ui-input>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <ui-input 
          type="url"
          label="Website" 
          placeholder="https://yourwebsite.com"
          icon="🌐"
          help-text="Include http:// or https://"
        ></ui-input>
      </div>
      
      <button 
        type="submit" 
        style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; width: 100%;"
      >
        Submit Form
      </button>
    </form>
  `,
  parameters: {
    docs: {
      description: {
        story: 'A complete form example showing how multiple inputs work together in a real-world scenario.'
      }
    }
  }
};