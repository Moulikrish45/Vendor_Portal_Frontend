import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';
import { FinanceDoc, MemoDoc } from '../../shared/models/finance.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrls: ['./finance.css']
})
export class FinanceComponent implements OnInit {
  // State
  activeTab: 'invoices' | 'memos' = 'invoices';
  isLoading = true;
  error = '';
  
  // Data
  invoices: FinanceDoc[] = [];
  filteredInvoices: FinanceDoc[] = [];
  
  memos: MemoDoc[] = [];
  filteredMemos: MemoDoc[] = [];

  // Search & Icons
  searchTerm = '';
  refreshIcon: SafeHtml;

  constructor(private api: ApiService, private sanitizer: DomSanitizer, private toast: ToastService) {
    this.refreshIcon = this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`
    );
  }

  ngOnInit() {
    this.loadData();
  }

  // KPIs
  get totalPayable(): number {
    return this.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  }

  get totalOverdue(): number {
    return this.invoices
      .filter(inv => inv.agingDays > 0)
      .reduce((sum, inv) => sum + inv.amount, 0);
  }

  loadData() {
    this.isLoading = true;
    this.error = '';
    const vendorId = sessionStorage.getItem('currentVendor') || '';

    // Load both Invoices and Memos
    // Note: In a real scenario, we might use forkJoin, but independent calls are fine here
    this.api.getFinanceData(vendorId).subscribe({
      next: (data) => {
        this.invoices = data.map(inv => ({
          ...inv,
          status: inv.agingDays > 0 ? 'Overdue' : 'Current'
        })).sort((a, b) => b.agingDays - a.agingDays); // Sort by risk (aging)
        
        this.applySearch();
      },
      error: () => this.error = 'Failed to load Financial Data.'
    });

    this.api.getMemoData(vendorId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.memos = data.sort((a, b) => new Date(b.postingDate).getTime() - new Date(a.postingDate).getTime());
          this.applySearch();
        }
      });
  }

  setActiveTab(tab: 'invoices' | 'memos') {
    this.activeTab = tab;
    this.searchTerm = ''; // Clear search when switching tabs
    this.applySearch();
  }

  applySearch() {
    const term = this.searchTerm.toLowerCase();

    if (this.activeTab === 'invoices') {
      this.filteredInvoices = this.invoices.filter(inv => 
        inv.invoiceNum.toLowerCase().includes(term) || 
        inv.amount.toString().includes(term)
      );
    } else {
      this.filteredMemos = this.memos.filter(mem => 
        mem.memoNum.toLowerCase().includes(term) || 
        mem.materialNo?.toLowerCase().includes(term) || false
      );
    }
  }

  downloadPdf() {
    this.toast.construction();
  }
}