import type { Preview } from '@storybook/web-components';

const preview: Preview = {
  parameters: {
    // Configure layout
    layout: 'centered',

    // Configure a11y addon
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          },
          {
            id: 'focus-order',
            enabled: true
          },
          {
            id: 'keyboard-navigation',
            enabled: true
          }
        ]
      },
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
        restoreScroll: true
      }
    }
  },

  // Global decorators for all stories
  decorators: [
    (story) => {
      // Add consistent styling container
      const container = document.createElement('div');
      container.style.cssText = `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 100%;
        box-sizing: border-box;
      `;
      
      const storyElement = story();
      if (storyElement instanceof HTMLElement) {
        container.appendChild(storyElement);
      } else {
        container.innerHTML = typeof storyElement === 'string' ? storyElement : '';
      }
      
      return container;
    }
  ],

  // Global args for all stories
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light Theme' },
          { value: 'dark', title: 'Dark Theme' },
          { value: 'auto', title: 'Auto Theme' }
        ],
        showName: true
      }
    },
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '<�<�', title: 'English' },
          { value: 'es', right: '<�<�', title: 'Espa�ol' },
          { value: 'fr', right: '<�<�', title: 'Fran�ais' },
          { value: 'de', right: '<�<�', title: 'Deutsch' }
        ]
      }
    }
  },

  // Tags for automatic docs generation
  tags: ['autodocs']
};

export default preview;