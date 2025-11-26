import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent {
  vendorId: string | null = '';
  isMobileMenuOpen = false; // State for mobile menu
  currentDate: Date = new Date(); // Current date

  constructor(private router: Router) {
    this.vendorId = sessionStorage.getItem('currentVendor');
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
}