import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

/**
 * Custom hook for localStorage management with TypeScript support
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Dispatch custom event for cross-tab synchronization
          window.dispatchEvent(
            new CustomEvent('localStorage-change', {
              detail: { key, newValue: valueToStore }
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch custom event for cross-tab synchronization
        window.dispatchEvent(
          new CustomEvent('localStorage-change', {
            detail: { key, newValue: null }
          })
        );
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this localStorage key from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail.key === key) {
        if (e.detail.newValue === null) {
          setStoredValue(initialValue);
        } else {
          setStoredValue(e.detail.newValue);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('localStorage-change', handleCustomStorageChange as EventListener);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('localStorage-change', handleCustomStorageChange as EventListener);
      };
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing multiple localStorage keys as a single object
 * @param keys - Array of localStorage keys to manage
 * @param initialValues - Object with initial values for each key
 * @returns [values, setValues, removeAll]
 */
export function useMultipleLocalStorage<T extends Record<string, any>>(
  keys: (keyof T)[],
  initialValues: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [values, setValues] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValues;
    }

    const result = { ...initialValues };
    
    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(key as string);
        if (item) {
          result[key] = JSON.parse(item);
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key as string}":`, error);
      }
    });

    return result;
  });

  const setValues = useCallback(
    (updates: Partial<T>) => {
      setValues(prev => {
        const newValues = { ...prev, ...updates };
        
        // Update localStorage for changed keys
        if (typeof window !== 'undefined') {
          Object.entries(updates).forEach(([key, value]) => {
            try {
              window.localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
              console.warn(`Error setting localStorage key "${key}":`, error);
            }
          });
        }
        
        return newValues;
      });
    },
    []
  );

  const removeAll = useCallback(() => {
    setValues(initialValues);
    
    if (typeof window !== 'undefined') {
      keys.forEach(key => {
        try {
          window.localStorage.removeItem(key as string);
        } catch (error) {
          console.warn(`Error removing localStorage key "${key as string}":`, error);
        }
      });
    }
  }, [keys, initialValues]);

  return [values, setValues, removeAll];
}