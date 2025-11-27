import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { GoodsReceipt } from '../../shared/models/goods-receipt.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goods-receipt.html',
  styleUrls: ['./goods-receipt.css']
})
export class GoodsReceiptComponent implements OnInit {
  receipts: GoodsReceipt[] = [];
  filteredReceipts: GoodsReceipt[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  
  refreshIcon: SafeHtml;

  constructor(private api: ApiService, private sanitizer: DomSanitizer) {
    this.refreshIcon = this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`
    );
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.error = '';
    const vendorId = sessionStorage.getItem('currentVendor') || '';

    this.api.getGoodsReceipts(vendorId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          // Sort by Date Descending (Newest first)
          this.receipts = data.sort((a, b) => 
            new Date(b.postingDate).getTime() - new Date(a.postingDate).getTime()
          );
          this.filteredReceipts = [...this.receipts];
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load Goods Receipt history.';
        }
      });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredReceipts = [...this.receipts];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredReceipts = this.receipts.filter(gr => 
        gr.matDocNum.toLowerCase().includes(term) || 
        gr.materialNo.toLowerCase().includes(term)
      );
    }
  }
}