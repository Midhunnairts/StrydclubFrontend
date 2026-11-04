import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

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

    // Call backend API to trigger MSG91 SendOTP or Email SMTP
    this.apiService.sendOtp(channel, value).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        // Switch view to type OTP screen
        this.waitingForOtp.set(true);

        if (res.mockMode && res.code) {
          this.otpSentMessage.set(`Simulated Code: ${res.code}`);
        } else {
          this.otpSentMessage.set(`A 6-digit verification code has been sent to ${value}.`);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Server connection failed';
        alert('Failed to send OTP: ' + errorMsg);
      }
    });
  }

  /**
   * Optional helper: Triggers the MSG91 OTP Widget popup
   */
  openMsg91Widget() {
    const phone = this.phoneNumber.trim();
    this.loading.set(true);

    const configuration = {
      widgetId: environment.msg91WidgetId || '366b63714641323136353833',
      tokenAuth: environment.msg91TokenAuth || '586808TRmIwbVp6aea1d2eP1',
      identifier: phone || undefined,
      exposeMethods: true,
      success: (data: any) => {
        console.log('[MSG91 OTP Widget Success]:', data);
        const accessToken = typeof data === 'string' ? data : (data?.['access-token'] || data?.message || data?.data || data?.token);
        if (accessToken) {
          this.verifyMsg91Token(accessToken);
        } else {
          this.loading.set(false);
        }
      },
      failure: (error: any) => {
        console.error('[MSG91 OTP Widget Failure]:', error);
        this.loading.set(false);
      }
    };

    if (typeof (window as any).initSendOTP === 'function') {
      (window as any).initSendOTP(configuration);
      this.loading.set(false);
    } else {
      this.loadOtpScript([
        'https://verify.msg91.com/otp-provider.js',
        'https://verify.phone91.com/otp-provider.js'
      ], configuration);
    }
  }

  private loadOtpScript(urls: string[], configuration: any) {
    let i = 0;
    const attempt = () => {
      const s = document.createElement('script');
      s.src = urls[i];
      s.async = true;
      s.onload = () => {
        this.loading.set(false);
        if (typeof (window as any).initSendOTP === 'function') {
          (window as any).initSendOTP(configuration);
        }
      };
      s.onerror = () => {
        i++;
        if (i < urls.length) {
          attempt();
        } else {
          this.loading.set(false);
          alert('Could not load MSG91 OTP widget provider.');
        }
      };
      document.head.appendChild(s);
    };
    attempt();
  }

  verifyMsg91Token(accessToken: string) {
    this.loading.set(true);
    this.apiService.verifyWidgetToken(accessToken).subscribe({
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
            this.router.navigate(['/events']);
          }
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Failed to verify MSG91 OTP access token';
        alert(errorMsg);
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
            this.router.navigate(['/events']);
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
    alert('Please sign in using your Phone Number or Email with a 6-digit verification code.');
  }
}
