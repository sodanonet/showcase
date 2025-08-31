module.exports = {
  projects: [
    // React Component Testing
    {
      displayName: 'React Components',
      testMatch: ['<rootDir>/components/react/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/components/react/setup.ts'],
      moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/components/__mocks__/fileMock.js'
      },
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            ['@babel/preset-react', { runtime: 'automatic' }],
            '@babel/preset-typescript'
          ]
        }]
      }
    },
    
    // Vue Component Testing
    {
      displayName: 'Vue Components',
      testMatch: ['<rootDir>/components/vue/**/*.test.{js,ts}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/components/vue/setup.ts'],
      moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/../vue-remote/src/$1'
      },
      transform: {
        '^.+\\.vue$': '@vue/vue3-jest',
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-typescript'
          ]
        }]
      }
    },
    
    // Storybook Component Testing
    {
      displayName: 'Storybook Components',
      testMatch: ['<rootDir>/components/storybook/**/*.test.{js,ts}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/components/storybook/setup.ts'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            '@babel/preset-typescript'
          ]
        }]
      }
    },
    
    // API Testing
    {
      displayName: 'API Tests',
      testMatch: ['<rootDir>/api/**/*.test.{js,ts}'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/api/setup.ts']
    }
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/setup.{js,ts}'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};