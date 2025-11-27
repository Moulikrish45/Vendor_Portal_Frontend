import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      vendorId: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      password: ['', Validators.required]
    });
  }

  onVendorIdInput(event: any) {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    this.loginForm.patchValue({ vendorId: value }, { emitEvent: false });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = ''; // Clear previous errors

      const { vendorId, password } = this.loginForm.value;

      // Real API Call
      this.apiService.login(vendorId, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          if (response.success) {
            console.log('Login Successful:', response.message);
            // Save Vendor ID to session for other pages to use
            sessionStorage.setItem('currentVendor', vendorId);
            // Show success toast
            this.toast.success('Welcome!', `Login successful.`);
            // Navigate to Dashboard
            setTimeout(() => this.router.navigate(['/dashboard']), 500);
          } else {
            this.errorMessage = response.message || 'Invalid Credentials';
          }
        },
        error: (err) => {
          console.error('API Error:', err);
          this.isLoading = false;
          this.errorMessage = 'Connection to SAP failed. Please try again.';
        }
      });

    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}