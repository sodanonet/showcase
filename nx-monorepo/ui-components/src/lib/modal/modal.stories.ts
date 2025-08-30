import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './modal';
import '../button/button';
import '../input/input';

const meta: Meta = {
  title: 'Components/Modal',
  component: 'ui-modal',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal dialog component with customizable size, animations, and backdrop options. Features focus management, keyboard navigation, and accessibility support.'
      }
    }
  },
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Whether the modal is open'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'fullscreen'],
      description: 'The size of the modal'
    },
    closable: {
      control: { type: 'boolean' },
      description: 'Whether the modal shows a close button'
    },
    'close-on-backdrop': {
      control: { type: 'boolean' },
      description: 'Whether clicking the backdrop closes the modal'
    },
    'close-on-escape': {
      control: { type: 'boolean' },
      description: 'Whether pressing Escape closes the modal'
    },
    title: {
      control: { type: 'text' },
      description: 'Title text for the modal header'
    },
    subtitle: {
      control: { type: 'text' },
      description: 'Subtitle text for the modal header'
    },
    animation: {
      control: { type: 'select' },
      options: ['fade', 'scale', 'slide-up', 'slide-down'],
      description: 'Animation type for showing/hiding the modal'
    },
    backdrop: {
      control: { type: 'select' },
      options: ['default', 'blur', 'dark'],
      description: 'Backdrop style variant'
    },
    persistent: {
      control: { type: 'boolean' },
      description: 'Whether the modal cannot be closed by user actions'
    },
    'z-index': {
      control: { type: 'number' },
      description: 'Z-index value for the modal'
    }
  },
  args: {
    open: false,
    size: 'medium',
    closable: false,
    'close-on-backdrop': false,
    'close-on-escape': false,
    animation: 'fade',
    backdrop: 'default',
    persistent: false,
    'z-index': 1000
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: (args) => html`
    <div>
      <ui-button @button-click="${() => {
        const modal = document.querySelector('ui-modal');
        modal?.open();
      }}">
        Open Modal
      </ui-button>
      <ui-modal
        ?open="${args.open}"
        size="${args.size}"
        ?closable="${args.closable}"
        ?close-on-backdrop="${args['close-on-backdrop']}"
        ?close-on-escape="${args['close-on-escape']}"
        ?persistent="${args.persistent}"
        title="${args.title || ''}"
        subtitle="${args.subtitle || ''}"
        animation="${args.animation}"
        backdrop="${args.backdrop}"
        z-index="${args['z-index']}"
      >
        <p>This is the modal content. You can put any content here including text, forms, images, or other components.</p>
      </ui-modal>
    </div>
  `
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Open Small Modal
      </ui-button>
      <ui-modal size="small" closable close-on-backdrop close-on-escape title="Small Modal">
        <p>This is a small modal perfect for confirmations or brief messages.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Open Medium Modal
      </ui-button>
      <ui-modal size="medium" closable close-on-backdrop close-on-escape title="Medium Modal">
        <p>This is a medium modal suitable for most content and forms.</p>
        <p>It provides a good balance between content space and screen coverage.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Open Large Modal
      </ui-button>
      <ui-modal size="large" closable close-on-backdrop close-on-escape title="Large Modal">
        <p>This is a large modal ideal for complex content, detailed forms, or rich media.</p>
        <p>It provides maximum content space while still maintaining the modal experience.</p>
        <p>Perfect for data tables, multi-step forms, or detailed product views.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Open Fullscreen Modal
      </ui-button>
      <ui-modal size="fullscreen" closable close-on-backdrop close-on-escape title="Fullscreen Modal">
        <p>This is a fullscreen modal that takes up the entire viewport.</p>
        <p>Perfect for immersive experiences, detailed workflows, or when you need maximum screen real estate.</p>
        <p>Ideal for mobile experiences or complex applications.</p>
      </ui-modal>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different sizes of modal dialogs for various use cases.'
      }
    }
  }
};

export const Animations: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Fade Animation
      </ui-button>
      <ui-modal animation="fade" closable close-on-backdrop close-on-escape title="Fade Animation">
        <p>This modal uses a fade animation for smooth entrance and exit.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Scale Animation
      </ui-button>
      <ui-modal animation="scale" closable close-on-backdrop close-on-escape title="Scale Animation">
        <p>This modal uses a scale animation that grows from the center.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Slide Up Animation
      </ui-button>
      <ui-modal animation="slide-up" closable close-on-backdrop close-on-escape title="Slide Up Animation">
        <p>This modal slides up from the bottom, perfect for mobile experiences.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Slide Down Animation
      </ui-button>
      <ui-modal animation="slide-down" closable close-on-backdrop close-on-escape title="Slide Down Animation">
        <p>This modal slides down from the top.</p>
      </ui-modal>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different animation types for modal entrance and exit.'
      }
    }
  }
};

export const BackdropVariants: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Default Backdrop
      </ui-button>
      <ui-modal backdrop="default" closable close-on-backdrop close-on-escape title="Default Backdrop">
        <p>Standard backdrop with medium opacity.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Blur Backdrop
      </ui-button>
      <ui-modal backdrop="blur" closable close-on-backdrop close-on-escape title="Blur Backdrop">
        <p>Backdrop with blur effect that focuses attention on the modal content.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Dark Backdrop
      </ui-button>
      <ui-modal backdrop="dark" closable close-on-backdrop close-on-escape title="Dark Backdrop">
        <p>Darker backdrop for stronger contrast and focus.</p>
      </ui-modal>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different backdrop styles to enhance modal presentation.'
      }
    }
  }
};

export const InteractionModes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Basic Modal
      </ui-button>
      <ui-modal title="Basic Modal">
        <p>This modal has no close interactions. You need to use the public API to close it.</p>
        <ui-button @button-click="${(e: Event) => {
          const modal = (e.target as HTMLElement).closest('ui-modal') as any;
          modal?.close();
        }}">
          Close Programmatically
        </ui-button>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Closable Modal
      </ui-button>
      <ui-modal closable title="Closable Modal">
        <p>This modal has a close button in the header.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Backdrop Closable
      </ui-button>
      <ui-modal close-on-backdrop title="Backdrop Closable">
        <p>Click outside this modal to close it.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Escape Closable
      </ui-button>
      <ui-modal close-on-escape title="Escape Closable">
        <p>Press the Escape key to close this modal.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Full Interaction
      </ui-button>
      <ui-modal closable close-on-backdrop close-on-escape title="Full Interaction">
        <p>This modal can be closed with the close button, backdrop click, or Escape key.</p>
      </ui-modal>

      <ui-button @button-click="${(e: Event) => {
        const button = e.target as HTMLElement;
        const modal = button.nextElementSibling as any;
        modal?.open();
      }}">
        Persistent Modal
      </ui-button>
      <ui-modal persistent closable close-on-backdrop close-on-escape title="Persistent Modal">
        <p>This is a persistent modal that cannot be closed by user interactions, even with closable options enabled.</p>
        <ui-button @button-click="${(e: Event) => {
          const modal = (e.target as HTMLElement).closest('ui-modal') as any;
          modal?.removeAttribute('persistent');
          modal?.close();
        }}">
          Remove Persistent & Close
        </ui-button>
      </ui-modal>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different interaction modes for closing modals including persistent mode.'
      }
    }
  }
};

export const WithHeaderAndSubtitle: Story = {
  render: () => html`
    <ui-button @button-click="${(e: Event) => {
      const button = e.target as HTMLElement;
      const modal = button.nextElementSibling as any;
      modal?.open();
    }}">
      Open Modal with Header
    </ui-button>
    <ui-modal 
      closable 
      close-on-backdrop 
      close-on-escape 
      title="Account Settings"
      subtitle="Manage your account preferences and security settings"
    >
      <div style="space-y: 1rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem 0;">Profile Information</h4>
          <p style="color: #6b7280; margin-bottom: 1rem;">Update your personal details and preferences.</p>
          <ui-input label="Full Name" value="John Doe" style="margin-bottom: 0.5rem;"></ui-input>
          <ui-input type="email" label="Email Address" value="john@example.com"></ui-input>
        </div>
      </div>
    </ui-modal>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Modal with title and subtitle in the header section.'
      }
    }
  }
};

export const WithFooterSlot: Story = {
  render: () => html`
    <ui-button @button-click="${(e: Event) => {
      const button = e.target as HTMLElement;
      const modal = button.nextElementSibling as any;
      modal?.open();
    }}">
      Open Modal with Footer
    </ui-button>
    <ui-modal 
      closable 
      close-on-backdrop 
      close-on-escape 
      title="Confirm Action"
      subtitle="Are you sure you want to proceed?"
    >
      <p>This action will permanently delete the selected items. This cannot be undone.</p>
      <p style="color: #dc2626; font-weight: 500;">⚠️ This is a destructive action</p>
      
      <div slot="footer" style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <ui-button variant="secondary" @button-click="${(e: Event) => {
          const modal = (e.target as HTMLElement).closest('ui-modal') as any;
          modal?.close();
        }}">
          Cancel
        </ui-button>
        <ui-button variant="danger" @button-click="${(e: Event) => {
          const modal = (e.target as HTMLElement).closest('ui-modal') as any;
          console.log('Confirmed destructive action');
          modal?.close();
        }}">
          Delete Items
        </ui-button>
      </div>
    </ui-modal>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Modal with custom footer content using slots for action buttons.'
      }
    }
  }
};

export const FormModal: Story = {
  render: () => html`
    <ui-button @button-click="${(e: Event) => {
      const button = e.target as HTMLElement;
      const modal = button.nextElementSibling as any;
      modal?.open();
    }}">
      Create New User
    </ui-button>
    <ui-modal 
      size="medium"
      closable 
      close-on-backdrop 
      close-on-escape 
      title="Create New User"
      subtitle="Add a new team member to your organization"
    >
      <form style="space-y: 1rem;">
        <div style="margin-bottom: 1rem;">
          <ui-input 
            label="Full Name" 
            placeholder="Enter full name"
            required
            help-text="First and last name"
          ></ui-input>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <ui-input 
            type="email"
            label="Email Address" 
            placeholder="user@company.com"
            required
            help-text="Work email address"
          ></ui-input>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <ui-input 
            label="Job Title" 
            placeholder="Software Engineer"
            help-text="Role or position in the company"
          ></ui-input>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Department</label>
          <select style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
            <option>Engineering</option>
            <option>Design</option>
            <option>Product</option>
            <option>Marketing</option>
            <option>Sales</option>
          </select>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" style="margin: 0;" />
            <span style="font-size: 0.875rem;">Send welcome email to new user</span>
          </label>
        </div>
      </form>
      
      <div slot="footer" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.875rem; color: #6b7280;">
          * Required fields
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <ui-button variant="secondary" @button-click="${(e: Event) => {
            const modal = (e.target as HTMLElement).closest('ui-modal') as any;
            modal?.close();
          }}">
            Cancel
          </ui-button>
          <ui-button variant="primary" @button-click="${(e: Event) => {
            const modal = (e.target as HTMLElement).closest('ui-modal') as any;
            console.log('Creating user...');
            // Simulate form submission
            setTimeout(() => {
              console.log('User created successfully!');
              modal?.close();
            }, 1000);
          }}">
            Create User
          </ui-button>
        </div>
      </div>
    </ui-modal>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Complex form modal demonstrating real-world usage with various input types and validation.'
      }
    }
  }
};

export const EventHandling: Story = {
  render: () => html`
    <ui-button @button-click="${(e: Event) => {
      const button = e.target as HTMLElement;
      const modal = button.nextElementSibling as any;
      modal?.open();
    }}">
      Open Event Demo Modal
    </ui-button>
    <ui-modal 
      closable 
      close-on-backdrop 
      close-on-escape 
      title="Event Handling Demo"
      @modal-opened="${() => console.log('Modal opened event fired')}"
      @modal-closed="${() => console.log('Modal closed event fired')}"
      @close="${() => console.log('Modal close event fired')}"
    >
      <div>
        <h4>Event Monitoring</h4>
        <p>This modal demonstrates event handling. Open your browser console to see events as they fire.</p>
        
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
          <h5 style="margin-top: 0;">Available Events:</h5>
          <ul style="margin: 0; padding-left: 1.5rem;">
            <li><code>modal-opened</code> - Fired when modal becomes visible</li>
            <li><code>modal-closed</code> - Fired when modal becomes hidden</li>
            <li><code>close</code> - Fired when user attempts to close modal</li>
          </ul>
        </div>
        
        <p>Try different ways to close this modal and watch the console output.</p>
      </div>
    </ui-modal>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Modal demonstrating custom event handling. Check browser console to see events.'
      }
    }
  }
};

export const ResponsiveModal: Story = {
  render: () => html`
    <ui-button @button-click="${(e: Event) => {
      const button = e.target as HTMLElement;
      const modal = button.nextElementSibling as any;
      modal?.open();
    }}">
      Open Responsive Modal
    </ui-button>
    <ui-modal 
      size="large"
      animation="slide-up"
      closable 
      close-on-backdrop 
      close-on-escape 
      title="Responsive Design"
      subtitle="This modal adapts to different screen sizes"
    >
      <div>
        <h4>Desktop Experience</h4>
        <p>On desktop screens, this modal appears centered with the specified size and animation.</p>
        
        <h4 style="margin-top: 1.5rem;">Mobile Experience</h4>
        <p>On mobile devices (width ≤ 768px), this modal:</p>
        <ul>
          <li>Slides up from the bottom regardless of animation setting</li>
          <li>Takes full width with rounded corners only at the top</li>
          <li>Limits height to 90% of viewport</li>
          <li>Adjusts padding for better touch interaction</li>
        </ul>
        
        <p style="margin-top: 1.5rem;">
          Try resizing your browser window or viewing this in device emulation mode to see the responsive behavior.
        </p>
        
        <div style="background: #dbeafe; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
          <strong>💡 Tip:</strong> The slide-up animation works particularly well on mobile devices as it follows platform conventions.
        </div>
      </div>
    </ui-modal>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Modal demonstrating responsive design patterns for different screen sizes.'
      }
    }
  }
};