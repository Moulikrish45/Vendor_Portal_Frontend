import { Routes } from '@angular/router';
// This import will work now because we renamed login.ts to login.component.ts
import { LoginComponent } from './auth/login/login.component'; 

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
];