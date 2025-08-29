import { useState, useEffect, useCallback, useRef } from 'react';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface FetchOptions extends RequestInit {
  skip?: boolean;
  refetchOnMount?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Custom hook for making HTTP requests with TypeScript support
 * @param url - The URL to fetch from
 * @param options - Fetch options including custom options
 * @returns [state, refetch, cancel]
 */
export function useFetch<T = any>(
  url: string | null,
  options: FetchOptions = {}
): [FetchState<T>, () => void, () => void] {
  const {
    skip = false,
    refetchOnMount = true,
    retryCount = 0,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(
    async (retries = retryCount) => {
      if (!url || skip) return;

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else if (contentType?.includes('text/')) {
          data = (await response.text()) as T;
        } else {
          data = (await response.blob()) as T;
        }

        if (mountedRef.current) {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mountedRef.current) {
          const fetchError = error as Error;
          
          // Don't set error state if request was aborted
          if (fetchError.name === 'AbortError') {
            return;
          }

          // Retry logic
          if (retries > 0 && fetchError.name !== 'AbortError') {
            retryTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                fetchData(retries - 1);
              }
            }, retryDelay);
            return;
          }

          setState(prev => ({
            ...prev,
            loading: false,
            error: fetchError,
          }));
        }
      }
    },
    [url, skip, retryCount, retryDelay, fetchOptions]
  );

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  // Effect for initial fetch and dependency changes
  useEffect(() => {
    if (refetchOnMount) {
      fetchData();
    }
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [url, skip]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return [state, refetch, cancel];
}

/**
 * Hook for making multiple concurrent requests
 * @param urls - Array of URLs to fetch from
 * @param options - Fetch options
 * @returns [states, refetchAll, cancelAll]
 */
export function useMultipleFetch<T = any>(
  urls: (string | null)[],
  options: FetchOptions = {}
): [FetchState<T>[], () => void, () => void] {
  const [states, setStates] = useState<FetchState<T>[]>(
    urls.map(() => ({ data: null, loading: false, error: null }))
  );

  const abortControllersRef = useRef<(AbortController | null)[]>([]);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    if (options.skip) return;

    // Cancel all ongoing requests
    abortControllersRef.current.forEach(controller => {
      controller?.abort();
    });

    // Create new abort controllers
    abortControllersRef.current = urls.map(() => new AbortController());

    // Set loading state for all
    setStates(prev => prev.map(state => ({ ...state, loading: true, error: null })));

    // Fetch all URLs concurrently
    const promises = urls.map(async (url, index) => {
      if (!url) return null;

      try {
        const response = await fetch(url, {
          ...options,
          signal: abortControllersRef.current[index]?.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data: T;

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else if (contentType?.includes('text/')) {
          data = (await response.text()) as T;
        } else {
          data = (await response.blob()) as T;
        }

        return { index, data, error: null };
      } catch (error) {
        const fetchError = error as Error;
        if (fetchError.name === 'AbortError') {
          return null;
        }
        return { index, data: null, error: fetchError };
      }
    });

    try {
      const results = await Promise.allSettled(promises);
      
      if (mountedRef.current) {
        setStates(prev => {
          const newStates = [...prev];
          
          results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
              const { index: resultIndex, data, error } = result.value;
              newStates[resultIndex] = {
                data,
                loading: false,
                error,
              };
            } else if (result.status === 'rejected') {
              newStates[index] = {
                data: null,
                loading: false,
                error: result.reason,
              };
            }
          });
          
          return newStates;
        });
      }
    } catch (error) {
      console.error('Error in useMultipleFetch:', error);
    }
  }, [urls, options]);

  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach(controller => {
      controller?.abort();
    });
    setStates(prev => prev.map(state => ({ ...state, loading: false })));
  }, []);

  useEffect(() => {
    if (options.refetchOnMount !== false) {
      fetchAll();
    }

    return () => {
      abortControllersRef.current.forEach(controller => {
        controller?.abort();
      });
    };
  }, [urls.join(',')]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllersRef.current.forEach(controller => {
        controller?.abort();
      });
    };
  }, []);

  return [states, fetchAll, cancelAll];
}