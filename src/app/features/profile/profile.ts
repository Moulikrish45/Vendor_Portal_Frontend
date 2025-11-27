import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { VendorProfile } from '../../shared/models/profile.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: VendorProfile | null = null;
  isLoading = true;
  error = '';
  
  initials = '';
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
    const vendorId = sessionStorage.getItem('currentVendor') || '';

    this.api.getVendorProfile(vendorId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.initials = this.getInitials(data.name);
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load profile data.';
        }
      });
  }

  getInitials(name: string): string {
    if (!name) return 'V';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}