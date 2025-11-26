import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './core/layout/layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { PurchaseOrdersComponent } from './features/purchase-orders/purchase-orders';

// Import other components as you build them
// import { PurchaseOrdersComponent } from ...

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    
    // PROTECTED ROUTES
    { 
        path: '', 
        component: LayoutComponent, 
        canActivate: [authGuard], // Protects everything inside
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'purchase-orders', component: PurchaseOrdersComponent},
        ]
    }
];