import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { LayoutComponent } from './core/layout/layout';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { PurchaseOrdersComponent } from './features/purchase-orders/purchase-orders';
import { RfqComponent } from './features/rfq/rfq';
import { GoodsReceiptComponent } from './features/goods-receipt/goods-receipt';
import { FinanceComponent } from './features/finance/finance';
import { ProfileComponent } from './features/profile/profile';

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
            { path: 'rfq', component: RfqComponent},
            { path: 'goods-receipt', component: GoodsReceiptComponent},
            { path: 'finance', component: FinanceComponent},
            { path: 'profile', component: ProfileComponent},
        ]
    }
];