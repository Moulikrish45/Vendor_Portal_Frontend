import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { PurchaseOrder } from '../../shared/models/purchase-order.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-orders.html',
  styleUrls: ['./purchase-orders.css']
})
export class PurchaseOrdersComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  isLoading = true;
  error = '';
  refreshIcon: SafeHtml;
  searchTerm: string = '';

  constructor(private api: ApiService, private sanitizer: DomSanitizer) {
    this.refreshIcon = this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`
    );
  }

  ngOnInit() {
    this.loadOrders();
  }


  // Sum reflects current filtered list so stats stay in sync with UI
  get totalValue(): number {
    return this.filteredOrders.reduce((sum, order) => sum + order.netPrice, 0);
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredOrders = [...this.orders]; // Reset if empty
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredOrders = this.orders.filter(po => 
        po.poNumber.toLowerCase().includes(term) || 
        po.materialNo.toLowerCase().includes(term) // Bonus: Search by Material too
      );
    }
  }

  loadOrders() {
    this.isLoading = true;
    this.error = ''; // Reset error on reload
    const vendorId = sessionStorage.getItem('currentVendor') || '';

    this.api.getPurchaseOrders(vendorId)
      .pipe(
        // FIX 2: Finalize ensures this runs even if API fails, stopping the spinner
        finalize(() => this.isLoading = false) 
      )
      .subscribe({
        next: (data) => {
          this.orders = data.map(po => {
            const delivery = new Date(po.deliveryDate);
            const today = new Date();
            let status: any = 'Open';
            if (delivery < today) status = 'Urgent';
            
            return { ...po, status };
          });
          this.filteredOrders = [...this.orders]; // Initialize filteredOrders with all orders
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load Purchase Orders. Please check connection.';
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'badge-baltic';
      case 'Urgent': return 'badge-mahogany';
      default: return 'badge-carbon';
    }
  }
}