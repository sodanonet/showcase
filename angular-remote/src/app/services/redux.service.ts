import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { store, RootState, AppDispatch } from '../store';

@Injectable({
  providedIn: 'root'
})
export class ReduxService {
  private stateSubject = new BehaviorSubject<RootState>(store.getState());
  private unsubscribe: (() => void) | null = null;

  constructor() {
    // Subscribe to store changes
    this.unsubscribe = store.subscribe(() => {
      this.stateSubject.next(store.getState());
    });

    // Global state synchronization
    if (typeof window !== 'undefined') {
      // Listen for global state updates from other micro-frontends
      window.addEventListener('globalStateUpdate', this.handleGlobalStateUpdate.bind(this));
    }
  }

  private handleGlobalStateUpdate(event: any): void {
    if (event.detail) {
      switch (event.detail.type) {
        case 'GLOBAL_COUNTER_UPDATE':
          // Handle counter sync from other apps
          this.dispatch({
            type: 'counter/setFromGlobal',
            payload: event.detail.payload.value
          });
          break;
        case 'GLOBAL_THEME_UPDATE':
          this.dispatch({
            type: 'theme/setThemeMode',
            payload: event.detail.payload.mode
          });
          break;
        case 'GLOBAL_USER_UPDATE':
          if (event.detail.payload.logout) {
            this.dispatch({ type: 'user/clearUser' });
          }
          break;
      }
    }
  }

  // Get the current state
  getState(): RootState {
    return store.getState();
  }

  // Dispatch an action
  dispatch(action: any): any {
    return store.dispatch(action);
  }

  // Select a slice of state with RxJS Observable
  select<T>(selector: (state: RootState) => T): Observable<T> {
    return this.stateSubject.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }

  // Select counter state
  selectCounter(): Observable<RootState['counter']> {
    return this.select(state => state.counter);
  }

  // Select user state
  selectUser(): Observable<RootState['user']> {
    return this.select(state => state.user);
  }

  // Select theme state
  selectTheme(): Observable<RootState['theme']> {
    return this.select(state => state.theme);
  }

  // Select data state
  selectData(): Observable<RootState['data']> {
    return this.select(state => state.data);
  }

  // Cleanup
  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('globalStateUpdate', this.handleGlobalStateUpdate.bind(this));
    }
  }
}