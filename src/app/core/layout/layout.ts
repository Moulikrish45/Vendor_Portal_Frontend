import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { VendorProfile } from '../../shared/models/profile.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  vendorId = '';
  isMobileMenuOpen = false; // State for mobile menu
  currentDate: Date = new Date(); // Current date
  profile: VendorProfile | null = null;
  profileInitials = 'VP';
  profileSubtitle = 'Fetching profile...';
  isProfileLoading = false;

  constructor(private router: Router, private api: ApiService) {
    this.vendorId = sessionStorage.getItem('currentVendor') || '';
  }

  ngOnInit() {
    this.loadProfile();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Close menu when clicking a link on mobile
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    sessionStorage.removeItem('currentVendor');
    this.router.navigate(['/login']);
  }

  private loadProfile() {
    if (!this.vendorId) {
      this.profileSubtitle = 'Vendor ID missing';
      return;
    }

    this.isProfileLoading = true;
    this.api.getVendorProfile(this.vendorId).subscribe({
      next: (data) => {
        this.profile = data;
        this.profileInitials = this.getInitials(data.name);
        const location = [data.city, data.country].filter(Boolean).join(', ');
        this.profileSubtitle = location || 'Profile synced';
        this.isProfileLoading = false;
      },
      error: () => {
        this.profileSubtitle = 'Profile info unavailable';
        this.isProfileLoading = false;
      }
    });
  }

  private getInitials(name: string): string {
    if (!name) {
      return (this.vendorId?.slice(0, 2) || 'VP').toUpperCase();
    }
    return name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}