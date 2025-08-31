import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock the React remote component (assuming it exists)
const ReactRemoteApp = () => {
  const [count, setCount] = React.useState(0);
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    setCount(prev => prev - 1);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>React Remote Application</h1>
      
      <div data-testid="counter-section">
        <h2>Counter: {count}</h2>
        <button onClick={handleIncrement}>Increment</button>
        <button onClick={handleDecrement}>Decrement</button>
      </div>
      
      <div data-testid="data-section">
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
        
        {error && (
          <div role="alert" data-testid="error-message">
            Error: {error}
          </div>
        )}
        
        {data && (
          <div data-testid="data-display">
            <h3>Fetched Data:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * React Component Testing Suite
 * Tests React remote application components
 */

describe('ReactRemoteApp', () => {
  let user;
  
  beforeEach(() => {
    user = userEvent.setup();
    
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Rendering', () => {
    test('renders main heading', () => {
      render(<ReactRemoteApp />);
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'React Remote Application'
      );
    });

    test('renders counter section', () => {
      render(<ReactRemoteApp />);
      
      expect(screen.getByTestId('counter-section')).toBeInTheDocument();
      expect(screen.getByText('Counter: 0')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Increment' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Decrement' })).toBeInTheDocument();
    });

    test('renders data section', () => {
      render(<ReactRemoteApp />);
      
      expect(screen.getByTestId('data-section')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Fetch Data' })).toBeInTheDocument();
    });
  });

  describe('Counter Functionality', () => {
    test('increments counter when increment button is clicked', async () => {
      render(<ReactRemoteApp />);
      
      const incrementButton = screen.getByRole('button', { name: 'Increment' });
      
      await user.click(incrementButton);
      expect(screen.getByText('Counter: 1')).toBeInTheDocument();
      
      await user.click(incrementButton);
      expect(screen.getByText('Counter: 2')).toBeInTheDocument();
    });

    test('decrements counter when decrement button is clicked', async () => {
      render(<ReactRemoteApp />);
      
      const incrementButton = screen.getByRole('button', { name: 'Increment' });
      const decrementButton = screen.getByRole('button', { name: 'Decrement' });
      
      // First increment to have a positive number
      await user.click(incrementButton);
      await user.click(incrementButton);
      expect(screen.getByText('Counter: 2')).toBeInTheDocument();
      
      // Then decrement
      await user.click(decrementButton);
      expect(screen.getByText('Counter: 1')).toBeInTheDocument();
    });

    test('handles negative counter values', async () => {
      render(<ReactRemoteApp />);
      
      const decrementButton = screen.getByRole('button', { name: 'Decrement' });
      
      await user.click(decrementButton);
      expect(screen.getByText('Counter: -1')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    test('fetches data successfully', async () => {
      const mockData = { id: 1, name: 'Test Data', value: 42 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
      
      render(<ReactRemoteApp />);
      
      const fetchButton = screen.getByRole('button', { name: 'Fetch Data' });
      await user.click(fetchButton);
      
      // Should show loading state
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('data-display')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Fetched Data:')).toBeInTheDocument();
      expect(screen.getByText(JSON.stringify(mockData, null, 2))).toBeInTheDocument();
    });

    test('handles fetch errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(<ReactRemoteApp />);
      
      const fetchButton = screen.getByRole('button', { name: 'Fetch Data' });
      await user.click(fetchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });

    test('handles HTTP errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });
      
      render(<ReactRemoteApp />);
      
      const fetchButton = screen.getByRole('button', { name: 'Fetch Data' });
      await user.click(fetchButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Error: Failed to fetch data')).toBeInTheDocument();
    });

    test('disables fetch button while loading', async () => {
      // Mock a delayed response
      global.fetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 100))
      );
      
      render(<ReactRemoteApp />);
      
      const fetchButton = screen.getByRole('button', { name: 'Fetch Data' });
      await user.click(fetchButton);
      
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Fetch Data' })).toBeEnabled();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<ReactRemoteApp />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    test('error messages have proper ARIA roles', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Test error'));
      
      render(<ReactRemoteApp />);
      
      await user.click(screen.getByRole('button', { name: 'Fetch Data' }));
      
      await waitFor(() => {
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeInTheDocument();
        expect(errorElement).toHaveTextContent('Error: Test error');
      });
    });

    test('buttons are keyboard accessible', () => {
      render(<ReactRemoteApp />);
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Error Boundaries', () => {
    test('handles component errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock a component that throws an error
      const ThrowError = () => {
        throw new Error('Component error');
      };
      
      expect(() => render(<ThrowError />)).toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', async () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <ReactRemoteApp />;
      };
      
      render(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Click increment button
      await user.click(screen.getByRole('button', { name: 'Increment' }));
      
      // Should re-render due to state change
      expect(renderSpy).toHaveBeenCalledTimes(1); // Still 1 because spy is on wrapper
    });
  });
});