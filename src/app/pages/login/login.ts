import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  activeTab = signal<'phone' | 'email'>('phone');

  phoneNumber = '';
  emailAddress = '';
  otpCode = '';

  waitingForOtp = signal<boolean>(false);
  loading = signal<boolean>(false);
  otpSentMessage = signal<string>('');

  setTab(tab: 'phone' | 'email') {
    if (!this.waitingForOtp()) {
      this.activeTab.set(tab);
    }
  }

  onSubmit() {
    const channel = this.activeTab();
    const value = channel === 'phone' ? this.phoneNumber.trim() : this.emailAddress.trim();

    if (!value) return;

    this.loading.set(true);

    this.apiService.sendOtp(channel, value).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.waitingForOtp.set(true);
        if (res.mockMode && res.code) {
          this.otpSentMessage.set(`Simulated Code: ${res.code} (SMTP or SMS gateway not active)`);
        } else {
          this.otpSentMessage.set(`A 6-digit OTP code has been sent to ${value}.`);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Server connection failed';
        alert('Failed to send OTP: ' + errorMsg);
      }
    });
  }

  onVerifyOtp() {
    const channel = this.activeTab();
    const value = channel === 'phone' ? this.phoneNumber.trim() : this.emailAddress.trim();
    const code = this.otpCode;

    if (!code || code.length !== 6) {
      alert('Please enter a valid 6-digit verification code.');
      return;
    }

    this.loading.set(true);

    this.apiService.verifyOtp(channel, value, code).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', res.token);
          }
          if (res.user) {
            this.apiService.currentUser.set(res.user);
          }

          const isProfileComplete = res.user?.isProfileComplete;
          if (!isProfileComplete || res.isNewUser) {
            this.router.navigate(['/complete-profile']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Invalid or expired OTP. Please try again.';
        alert(errorMsg);
      }
    });
  }

  resendOtp() {
    const channel = this.activeTab();
    const value = channel === 'phone' ? this.phoneNumber.trim() : this.emailAddress.trim();
    if (!value) return;

    this.loading.set(true);
    this.apiService.sendOtp(channel, value).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.otpCode = '';
        if (res.mockMode && res.code) {
          this.otpSentMessage.set(`Simulated Resend Code: ${res.code}`);
        } else {
          this.otpSentMessage.set(`A new 6-digit verification code was sent to ${value}.`);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Failed to resend OTP';
        alert(errorMsg);
      }
    });
  }

  goBack() {
    this.waitingForOtp.set(false);
    this.otpCode = '';
    this.otpSentMessage.set('');
  }

  loginWithGoogle() {
    console.log('Logging in with Google...');
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'mock-google-token');
    }
    this.apiService.loadUserProfile();
    this.router.navigate(['/dashboard']);
  }
}

