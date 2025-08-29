// Common types used across micro-frontend applications

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string | number;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  salary: number;
  startDate: Date;
  status: 'active' | 'inactive';
  skills?: string[];
  manager?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  inStock: boolean;
  stock: number;
  rating?: number;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface Theme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  shadow: string;
}

export interface RemoteModuleConfig {
  name: string;
  url: string;
  port: number;
  exposed: Record<string, string>;
  framework: 'react' | 'vue' | 'angular' | 'web-component' | 'vanilla';
  version: string;
  status: 'online' | 'offline' | 'loading' | 'error';
}

export interface MicroFrontendShell {
  name: string;
  version: string;
  remotes: RemoteModuleConfig[];
  shared: Record<string, any>;
  routing: RouteConfig[];
}

export interface RouteConfig {
  path: string;
  remote?: string;
  component?: string;
  title: string;
  description?: string;
  icon?: string;
  protected?: boolean;
  roles?: string[];
}

export interface ErrorInfo {
  message: string;
  stack?: string;
  code?: string | number;
  timestamp: string;
  userId?: string;
  url: string;
  userAgent: string;
  component?: string;
  remote?: string;
}

export interface NotificationConfig {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  createdAt: string;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  defaultValue?: any;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

// Event types for cross-framework communication
export interface MicroFrontendEvent<T = any> {
  type: string;
  payload: T;
  source: string;
  timestamp: number;
  id: string;
}

export interface EventBus {
  emit<T>(event: string, payload: T): void;
  on<T>(event: string, handler: (payload: T) => void): () => void;
  off(event: string, handler: Function): void;
  once<T>(event: string, handler: (payload: T) => void): void;
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface LoadingState {
  component: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'loading' | 'loaded' | 'error';
}