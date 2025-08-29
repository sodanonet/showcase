// API utilities
export { httpClient, createHttpClient, createApiClient } from './api/httpClient';
export type { RequestConfig, ApiError } from './api/httpClient';

// Event Bus utilities
export { 
  globalEventBus, 
  createEventBus, 
  microFrontendEvents, 
  microFrontendEmitters 
} from './events/eventBus';
export type { EventHandler, EventSubscription, EventBusOptions } from './events/eventBus';