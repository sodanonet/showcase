import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './card';
import '../button/button';

const meta: Meta = {
  title: 'Components/Card',
  component: 'ui-card',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card container component with header, content, and footer sections. Supports multiple variants, padding options, and interactive states.'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'outlined', 'filled'],
      description: 'The visual style variant of the card'
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'small', 'medium', 'large'],
      description: 'The padding size inside the card'
    },
    rounded: {
      control: { type: 'boolean' },
      description: 'Whether the card has rounded corners'
    },
    hoverable: {
      control: { type: 'boolean' },
      description: 'Whether the card has hover effects'
    },
    clickable: {
      control: { type: 'boolean' },
      description: 'Whether the card is clickable'
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the card shows a loading state'
    },
    header: {
      control: { type: 'text' },
      description: 'Header text content'
    },
    footer: {
      control: { type: 'text' },
      description: 'Footer text content'
    }
  },
  args: {
    variant: 'default',
    padding: 'medium',
    rounded: false,
    hoverable: false,
    clickable: false,
    loading: false
  }
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {},
  render: (args) => html`
    <ui-card
      variant="${args.variant}"
      padding="${args.padding}"
      ?rounded="${args.rounded}"
      ?hoverable="${args.hoverable}"
      ?clickable="${args.clickable}"
      ?loading="${args.loading}"
      header="${args.header || ''}"
      footer="${args.footer || ''}"
      style="width: 300px;"
    >
      <p>This is the main content area of the card. You can put any content here, including text, images, forms, or other components.</p>
    </ui-card>
  `
};

export const Variants: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
      <ui-card variant="default" header="Default Card">
        <p>A standard card with default styling.</p>
      </ui-card>
      <ui-card variant="elevated" header="Elevated Card">
        <p>A card with shadow elevation effect.</p>
      </ui-card>
      <ui-card variant="outlined" header="Outlined Card">
        <p>A card with a prominent border outline.</p>
      </ui-card>
      <ui-card variant="filled" header="Filled Card">
        <p>A card with a filled background color.</p>
      </ui-card>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different visual variants of the card component.'
      }
    }
  }
};

export const WithHeaderAndFooter: Story = {
  render: () => html`
    <ui-card 
      variant="elevated" 
      header="Card Title"
      footer="Card Footer"
      style="width: 350px;"
    >
      <p>This card demonstrates the header and footer sections. The header typically contains a title or important information, while the footer might contain actions or additional details.</p>
    </ui-card>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Card with both header and footer content.'
      }
    }
  }
};

export const WithSlottedContent: Story = {
  render: () => html`
    <ui-card variant="elevated" style="width: 350px;">
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0;">Custom Header</h3>
        <ui-button size="small" variant="secondary">Edit</ui-button>
      </div>
      
      <div>
        <h4>Main Content</h4>
        <p>This demonstrates how to use slots for more complex header and footer content.</p>
        <ul>
          <li>Custom HTML in header slot</li>
          <li>Rich content in main area</li>
          <li>Action buttons in footer slot</li>
        </ul>
      </div>
      
      <div slot="footer" style="display: flex; justify-content: flex-end; gap: 0.5rem;">
        <ui-button size="small" variant="secondary" outline>Cancel</ui-button>
        <ui-button size="small" variant="primary">Save</ui-button>
      </div>
    </ui-card>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Card using slots for complex header and footer content with interactive elements.'
      }
    }
  }
};

export const PaddingVariants: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
      <ui-card padding="none" variant="outlined" header="No Padding">
        <div style="padding: 0.5rem; background: #f0f0f0;">
          Content with no card padding
        </div>
      </ui-card>
      <ui-card padding="small" variant="outlined" header="Small Padding">
        <p>Content with small padding</p>
      </ui-card>
      <ui-card padding="medium" variant="outlined" header="Medium Padding">
        <p>Content with medium padding (default)</p>
      </ui-card>
      <ui-card padding="large" variant="outlined" header="Large Padding">
        <p>Content with large padding</p>
      </ui-card>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Different padding sizes for card content.'
      }
    }
  }
};

export const InteractiveStates: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
      <ui-card variant="elevated" header="Normal Card">
        <p>A standard card with no special interactions.</p>
      </ui-card>
      
      <ui-card 
        variant="elevated" 
        hoverable 
        header="Hoverable Card"
      >
        <p>This card has hover effects. Try hovering over it!</p>
      </ui-card>
      
      <ui-card 
        variant="elevated" 
        clickable 
        header="Clickable Card"
        @card-click="${(e: CustomEvent) => {
          console.log('Card clicked!', e.detail);
          alert('Card clicked! Check console for details.');
        }}"
      >
        <p>This card is clickable. Click anywhere on the card!</p>
      </ui-card>
      
      <ui-card 
        variant="elevated" 
        rounded 
        header="Rounded Card"
      >
        <p>This card has rounded corners for a softer appearance.</p>
      </ui-card>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Cards demonstrating different interactive states and styling options.'
      }
    }
  }
};

export const LoadingState: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem;">
      <ui-card 
        variant="elevated" 
        header="Normal Card"
        style="width: 300px;"
      >
        <p>This is a normal card with content visible.</p>
        <ui-button variant="primary">Action Button</ui-button>
      </ui-card>
      
      <ui-card 
        variant="elevated" 
        header="Loading Card"
        loading
        style="width: 300px;"
      >
        <p>This content is hidden behind the loading overlay.</p>
        <ui-button variant="primary">Hidden Button</ui-button>
      </ui-card>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Comparison between normal and loading states of cards.'
      }
    }
  }
};

export const ComplexContent: Story = {
  render: () => html`
    <ui-card variant="elevated" style="width: 400px;">
      <div slot="header" style="display: flex; align-items: center; gap: 1rem;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);"></div>
        <div>
          <h3 style="margin: 0; font-size: 1.125rem;">John Doe</h3>
          <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Software Engineer</p>
        </div>
      </div>
      
      <div style="space-y: 1rem;">
        <div>
          <h4 style="margin: 0 0 0.5rem 0;">About</h4>
          <p style="color: #6b7280; line-height: 1.5;">
            Passionate developer with 5+ years of experience in building scalable web applications. 
            Specializes in React, TypeScript, and Node.js.
          </p>
        </div>
        
        <div>
          <h4 style="margin: 1rem 0 0.5rem 0;">Skills</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">React</span>
            <span style="background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">Node.js</span>
            <span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">TypeScript</span>
            <span style="background: #fce7f3; color: #be185d; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">GraphQL</span>
          </div>
        </div>
      </div>
      
      <div slot="footer" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 1rem;">
          <button style="background: none; border: none; color: #6b7280; cursor: pointer;">
            👤 Profile
          </button>
          <button style="background: none; border: none; color: #6b7280; cursor: pointer;">
            💬 Message
          </button>
        </div>
        <ui-button size="small" variant="primary">Connect</ui-button>
      </div>
    </ui-card>
  `,
  parameters: {
    docs: {
      description: {
        story: 'A complex card example resembling a user profile card with avatar, information, and actions.'
      }
    }
  }
};

export const CardGrid: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
      <ui-card variant="elevated" hoverable>
        <div slot="header">
          <h3 style="margin: 0; color: #1f2937;">Analytics Dashboard</h3>
        </div>
        <div>
          <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <span style="font-size: 2rem; font-weight: bold; color: #059669;">$12,543</span>
            <span style="color: #059669; font-size: 0.875rem;">+12.5%</span>
          </div>
          <p style="color: #6b7280; margin: 0;">Total revenue this month</p>
        </div>
      </ui-card>
      
      <ui-card variant="elevated" hoverable>
        <div slot="header">
          <h3 style="margin: 0; color: #1f2937;">User Growth</h3>
        </div>
        <div>
          <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <span style="font-size: 2rem; font-weight: bold; color: #2563eb;">1,234</span>
            <span style="color: #2563eb; font-size: 0.875rem;">+8.2%</span>
          </div>
          <p style="color: #6b7280; margin: 0;">New users this week</p>
        </div>
      </ui-card>
      
      <ui-card variant="elevated" hoverable>
        <div slot="header">
          <h3 style="margin: 0; color: #1f2937;">Conversion Rate</h3>
        </div>
        <div>
          <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 1rem;">
            <span style="font-size: 2rem; font-weight: bold; color: #dc2626;">3.24%</span>
            <span style="color: #dc2626; font-size: 0.875rem;">-1.1%</span>
          </div>
          <p style="color: #6b7280; margin: 0;">Compared to last month</p>
        </div>
      </ui-card>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'A grid of cards showing how they can be used for dashboard-style layouts.'
      }
    }
  }
};