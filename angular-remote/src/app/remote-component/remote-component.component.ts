import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReduxService } from '../services/redux.service';
import { RootState } from '../store';
import { increment, decrement, incrementByAmount, reset, multiplyBy } from '../store/slices/counter.slice';
import { setThemeMode, applyAngularPreset, toggleAnimations } from '../store/slices/theme.slice';
import { simulateLogin, clearUser, updatePreferences, incrementActions } from '../store/slices/user.slice';
import { addDataItem, updateDataItem, removeDataItem, setFilter } from '../store/slices/data.slice';

@Component({
  selector: 'app-remote-component',
  templateUrl: './remote-component.component.html',
  styleUrls: ['./remote-component.component.css']
})
export class RemoteComponent implements OnInit, OnDestroy {
  title = 'Angular Remote Micro-Frontend';
  
  // Redux observables
  counter$: Observable<RootState['counter']>;
  user$: Observable<RootState['user']>;
  theme$: Observable<RootState['theme']>;
  data$: Observable<RootState['data']>;
  
  // Local state
  customAmount = 5;
  newTaskForm: FormGroup;
  newDataForm: FormGroup;
  
  private destroy$ = new Subject<void>();
  
  // Dynamic content
  selectedPriority = 'all';
  searchTerm = '';
  currentTime = new Date();

  // Mock data for template
  tasks: any[] = [
    { id: '1', name: 'Review Angular Updates', priority: 'high', category: 'Development', completed: false },
    { id: '2', name: 'Optimize Component Performance', priority: 'medium', category: 'Development', completed: true },
    { id: '3', name: 'Update Documentation', priority: 'low', category: 'Documentation', completed: false }
  ];
  
  constructor(private fb: FormBuilder, private reduxService: ReduxService) {
    this.newTaskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      priority: ['medium', Validators.required],
      category: ['Development', Validators.required]
    });

    this.newDataForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      value: [0, [Validators.required, Validators.min(0)]],
      category: ['Development', Validators.required]
    });

    // Initialize Redux observables
    this.counter$ = this.reduxService.selectCounter();
    this.user$ = this.reduxService.selectUser();
    this.theme$ = this.reduxService.selectTheme();
    this.data$ = this.reduxService.selectData();
  }
  
  ngOnInit() {
    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Redux Counter methods
  incrementCounter() {
    this.reduxService.dispatch(increment());
    this.reduxService.dispatch(incrementActions());
  }
  
  decrementCounter() {
    this.reduxService.dispatch(decrement());
    this.reduxService.dispatch(incrementActions());
  }
  
  resetCounter() {
    this.reduxService.dispatch(reset());
    this.reduxService.dispatch(incrementActions());
  }

  addCustomAmount() {
    this.reduxService.dispatch(incrementByAmount(this.customAmount));
    this.reduxService.dispatch(incrementActions());
  }

  multiplyCounter(factor: number) {
    this.reduxService.dispatch(multiplyBy(factor));
    this.reduxService.dispatch(incrementActions());
  }

  // Redux Data management methods
  addDataItem() {
    if (this.newDataForm.valid) {
      this.reduxService.dispatch(addDataItem({
        name: this.newDataForm.value.name,
        value: this.newDataForm.value.value,
        category: this.newDataForm.value.category
      }));
      this.newDataForm.reset({ category: 'Development', value: 0 });
    }
  }

  updateDataItem(id: string, updates: any) {
    this.reduxService.dispatch(updateDataItem({ id, updates }));
  }

  removeDataItem(id: string) {
    this.reduxService.dispatch(removeDataItem(id));
  }

  setDataFilter(filter: any) {
    this.reduxService.dispatch(setFilter(filter));
  }

  // User management methods
  loginUser() {
    this.reduxService.dispatch(simulateLogin({
      username: 'Angular Admin',
      email: 'admin@angular-remote.com',
      department: 'Frontend Engineering'
    }));
  }

  logoutUser() {
    this.reduxService.dispatch(clearUser());
    
    // Notify other micro-frontends
    if (typeof window !== 'undefined' && (window as any).__GLOBAL_STATE_MANAGER__) {
      (window as any).__GLOBAL_STATE_MANAGER__.dispatch({
        type: 'user/globalLogout',
        source: 'angular-remote'
      });
    }
  }

  updateUserPreferences(preferences: any) {
    this.reduxService.dispatch(updatePreferences(preferences));
  }

  // Theme management methods
  setTheme(mode: 'light' | 'dark' | 'auto') {
    this.reduxService.dispatch(setThemeMode(mode));
  }

  applyThemePreset(preset: 'material' | 'bootstrap' | 'custom' | 'dark-material') {
    this.reduxService.dispatch(applyAngularPreset(preset));
  }

  toggleThemeAnimations() {
    this.reduxService.dispatch(toggleAnimations());
  }
  
  // Utility methods
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#7f8c8d';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'Development': return '#3498db';
      case 'Architecture': return '#9b59b6';
      case 'Testing': return '#e67e22';
      default: return '#7f8c8d';
    }
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  getThemeStyles(theme: any) {
    return {
      '--primary-color': theme.primaryColor,
      '--secondary-color': theme.secondaryColor,
      '--accent-color': theme.accentColor,
      'font-size': theme.fontSize === 'small' ? '14px' : 
                   theme.fontSize === 'large' ? '18px' : '16px',
      '--border-radius': theme.borderRadius === 'none' ? '0' :
                        theme.borderRadius === 'small' ? '4px' :
                        theme.borderRadius === 'large' ? '12px' : '8px'
    };
  }

  // Missing methods referenced in template
  getTotalUsers(): number {
    return 1247; // Mock data
  }

  getTotalRevenue(): number {
    return 87650; // Mock data
  }

  getAverageConversion(): number {
    return 23.8; // Mock data
  }

  get analyticsData(): any[] {
    return [
      { metric: 'Page Views', value: 12450, change: '+15%' },
      { metric: 'Unique Visitors', value: 8920, change: '+8%' },
      { metric: 'Conversion Rate', value: 23.8, change: '+12%' },
      { metric: 'Revenue', value: 87650, change: '+25%' }
    ];
  }

  // Simple counter methods for template
  increment() {
    this.incrementCounter();
  }

  decrement() {
    this.decrementCounter();
  }

  reset() {
    this.resetCounter();
  }

  get counter(): number {
    // Return mock counter value for template
    return 0;
  }

  // Task management methods
  addTask() {
    if (this.newTaskForm.valid) {
      const newTask = {
        id: Date.now().toString(),
        name: this.newTaskForm.value.name,
        priority: this.newTaskForm.value.priority,
        category: this.newTaskForm.value.category,
        completed: false
      };
      this.tasks.push(newTask);
      this.newTaskForm.reset({ priority: 'medium', category: 'Development' });
    }
  }

  toggleTask(id: string) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
    }
  }

  deleteTask(id: string) {
    this.tasks = this.tasks.filter(t => t.id !== id);
  }

  get filteredTasks(): any[] {
    return this.tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesPriority = this.selectedPriority === 'all' || task.priority === this.selectedPriority;
      return matchesSearch && matchesPriority;
    });
  }

  trackByTaskId(index: number, task: any): string {
    return task.id;
  }

  getCompletionPercentage(): number {
    const completed = this.tasks.filter(t => t.completed).length;
    return this.tasks.length ? Math.round((completed / this.tasks.length) * 100) : 0;
  }
}