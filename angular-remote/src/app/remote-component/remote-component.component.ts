import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-remote-component',
  templateUrl: './remote-component.component.html',
  styleUrls: ['./remote-component.component.css']
})
export class RemoteComponent implements OnInit {
  title = 'Angular Remote Micro-Frontend';
  
  // Counter functionality
  counter = 0;
  
  // Task management
  tasks = [
    { id: 1, name: 'Learn Angular 17', completed: true, priority: 'high' },
    { id: 2, name: 'Master TypeScript', completed: true, priority: 'high' },
    { id: 3, name: 'Build Micro-frontend', completed: false, priority: 'medium' },
    { id: 4, name: 'Implement RxJS', completed: false, priority: 'low' }
  ];
  
  newTaskForm: FormGroup;
  
  // Analytics data
  analyticsData = [
    { month: 'Jan', users: 1200, revenue: 25000, conversion: 3.2 },
    { month: 'Feb', users: 1450, revenue: 28500, conversion: 3.6 },
    { month: 'Mar', users: 1680, revenue: 32000, conversion: 4.1 },
    { month: 'Apr', users: 1920, revenue: 38500, conversion: 4.5 },
    { month: 'May', users: 2150, revenue: 42000, conversion: 4.8 },
    { month: 'Jun', users: 2380, revenue: 48500, conversion: 5.2 }
  ];
  
  // Dynamic content
  selectedPriority = 'all';
  searchTerm = '';
  currentTime = new Date();
  
  constructor(private fb: FormBuilder) {
    this.newTaskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      priority: ['medium', Validators.required]
    });
  }
  
  ngOnInit() {
    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
  
  // Counter methods
  increment() {
    this.counter++;
  }
  
  decrement() {
    this.counter--;
  }
  
  reset() {
    this.counter = 0;
  }
  
  // Task management methods
  addTask() {
    if (this.newTaskForm.valid) {
      const newTask = {
        id: Math.max(...this.tasks.map(t => t.id)) + 1,
        name: this.newTaskForm.value.name,
        completed: false,
        priority: this.newTaskForm.value.priority
      };
      this.tasks.push(newTask);
      this.newTaskForm.reset({ priority: 'medium' });
    }
  }
  
  toggleTask(taskId: number) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
    }
  }
  
  deleteTask(taskId: number) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }
  
  // Filtering methods
  get filteredTasks() {
    let filtered = this.tasks;
    
    if (this.selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === this.selectedPriority);
    }
    
    if (this.searchTerm) {
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }
  
  // Analytics methods
  getTotalUsers() {
    return this.analyticsData.reduce((total, month) => total + month.users, 0);
  }
  
  getTotalRevenue() {
    return this.analyticsData.reduce((total, month) => total + month.revenue, 0);
  }
  
  getAverageConversion() {
    const total = this.analyticsData.reduce((sum, month) => sum + month.conversion, 0);
    return (total / this.analyticsData.length).toFixed(1);
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
  
  getCompletionPercentage(): number {
    const completed = this.tasks.filter(t => t.completed).length;
    return Math.round((completed / this.tasks.length) * 100) || 0;
  }

  trackByTaskId(index: number, task: any): number {
    return task.id;
  }
}