import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  activeTab = signal<'phone' | 'email'>('phone');

  phoneNumber = '';
  emailAddress = '';

  setTab(tab: 'phone' | 'email') {
    this.activeTab.set(tab);
  }

  onSubmit() {
    const channel = this.activeTab();
    const value = channel === 'phone' ? this.phoneNumber : this.emailAddress;

    if (!value) return;

    // Send mock OTP
    this.http.post<{ success: boolean; message: string }>('http://localhost:3000/api/auth/send-otp', {
      channel,
      value
    }).subscribe({
      next: () => {
        // Automatically verify OTP with code 123456 for a seamless user experience
        this.http.post<{ success: boolean; token: string; user: any }>('http://localhost:3000/api/auth/verify-otp', {
          channel,
          value,
          code: '123456'
        }).subscribe({
          next: (res) => {
            if (res.success) {
              // Store credentials locally
              localStorage.setItem('token', res.token);
              localStorage.setItem('user', JSON.stringify(res.user));
              
              // Redirect to user dashboard page
              this.router.navigate(['/dashboard']);
            }
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Verification failed';
            alert(errorMsg);
          }
        });
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Server connection failed';
        alert('Failed to send OTP: ' + errorMsg);
      }
    });
  }

  loginWithGoogle() {
    console.log('Logging in with Google...');
    // Simulated Google login
    localStorage.setItem('token', 'mock-google-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'Google Athlete',
      email: 'athlete.google@strydclub.com',
      phone: '+91 9999999999',
      favoriteSports: ['Running'],
      memberSince: 'January 2026',
      totalEvents: 1,
      eventsWon: 0,
      sportsPlayed: 1
    }));
    this.router.navigate(['/dashboard']);
  }
}
