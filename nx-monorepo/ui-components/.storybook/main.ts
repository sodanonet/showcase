import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    // Only include addons that are actually installed and working
    '@storybook/addon-links',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation'
  },
  features: {
    buildStoriesJson: true
  }
};

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
