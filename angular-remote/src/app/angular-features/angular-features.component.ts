import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, interval, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-angular-features',
  templateUrl: './angular-features.component.html',
  styleUrls: ['./angular-features.component.css']
})
export class AngularFeaturesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // RxJS Observable demonstration
  currentTimestamp$ = interval(1000).pipe(
    map(() => new Date().getTime()),
    takeUntil(this.destroy$)
  );
  
  // Lifecycle hooks demonstration
  lifecycleEvents: string[] = [];
  
  // Data binding examples
  inputValue = 'Two-way data binding example';
  items = ['Angular 17', 'TypeScript', 'RxJS', 'Module Federation'];
  selectedItem = '';
  
  // Event handling
  clickCount = 0;
  
  constructor() {
    this.addLifecycleEvent('Constructor called');
  }
  
  ngOnInit() {
    this.addLifecycleEvent('OnInit - Component initialized');
  }
  
  ngOnDestroy() {
    this.addLifecycleEvent('OnDestroy - Component destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private addLifecycleEvent(event: string) {
    this.lifecycleEvents.push(`${new Date().toLocaleTimeString()}: ${event}`);
  }
  
  onItemSelect(item: string) {
    this.selectedItem = item;
  }
  
  handleClick() {
    this.clickCount++;
  }
  
  resetClick() {
    this.clickCount = 0;
  }
}