import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Important for Search
import { ApiService } from '../../shared/services/api.service';
import { RFQ } from '../../shared/models/rfq.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rfq.html',
  styleUrls: ['./rfq.css']
})
export class RfqComponent implements OnInit {
  rfqs: RFQ[] = [];
  filteredRfqs: RFQ[] = [];
  isLoading = true;
  error = '';
  searchTerm = '';
  showToast = false;
  
  // Icons
  refreshIcon: SafeHtml;
  bidIcon: SafeHtml;

  constructor(private api: ApiService, private sanitizer: DomSanitizer) {
    this.refreshIcon = this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`
    );
    this.bidIcon = this.sanitizer.bypassSecurityTrustHtml(
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`
    );
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.error = '';
    const vendorId = sessionStorage.getItem('currentVendor') || '';

    this.api.getRFQs(vendorId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.rfqs = data.map(item => {
            // Calculate Days Open
            const created = new Date(item.rfqDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - created.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            return { ...item, daysOpen: diffDays };
          });
          this.filteredRfqs = [...this.rfqs];
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load RFQs.';
        }
      });
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredRfqs = [...this.rfqs];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRfqs = this.rfqs.filter(r => 
        r.rfqNumber.toLowerCase().includes(term) || 
        r.materialText.toLowerCase().includes(term)
      );
    }
  }

  submitBid(rfq: RFQ) {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 4000);
  }
}