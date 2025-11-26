import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { basicAuthInterceptor } from './core/interceptors/basic-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Register HttpClient with our new Interceptor
    provideHttpClient(withInterceptors([basicAuthInterceptor])) 
  ]
};