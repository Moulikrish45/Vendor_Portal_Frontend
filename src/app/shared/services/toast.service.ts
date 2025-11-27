import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private toastCounter = 0;

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  show(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration = 4000) {
    const id = `toast-${++this.toastCounter}`;
    const toast: Toast = { id, title, message, type, duration };
    
    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string) {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  // Convenience methods
  info(title: string, message: string) {
    this.show(title, message, 'info');
  }

  success(title: string, message: string) {
    this.show(title, message, 'success');
  }

  warning(title: string, message: string) {
    this.show(title, message, 'warning');
  }

  error(title: string, message: string) {
    this.show(title, message, 'error');
  }

  maintenance() {
    this.show('Under Maintenance', 'This feature is currently under maintenance. Please try again later.', 'info');
  }

  construction() {
    this.show('Under Construction', 'This feature is currently under construction. Coming soon!', 'info');
  }
}
