import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.scss'
})
export class CompleteProfileComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  fullName = '';
  location = '';
  email = '';
  phone = '';
  loginChannel: 'phone' | 'email' = 'phone';
  selectedSports: string[] = ['Running'];

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  availableSports = [
    { name: 'Running', icon: '🏃' },
    { name: 'Badminton', icon: '🏸' },
    { name: 'Football', icon: '⚽' },
    { name: 'Volleyball', icon: '🏐' },
    { name: 'Pickleball', icon: '🎾' },
    { name: 'Kho Kho', icon: '🏹' },
    { name: 'Cricket', icon: '🏏' }
  ];

  ngOnInit() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      const user = this.apiService.currentUser();
      if (user) {
        this.initForm(user);
      } else {
        this.apiService.getUserProfile(token).subscribe({
          next: (res) => {
            if (res.success && res.user) {
              this.apiService.currentUser.set(res.user);
              this.initForm(res.user);
            }
          },
          error: () => {
            this.router.navigate(['/login']);
          }
        });
      }
    }
  }

  initForm(user: any) {
    this.fullName = user.name || '';
    this.location = user.location || '';
    this.email = user.email || '';
    this.phone = user.phone || '';
    this.loginChannel = user.loginChannel || (user.phone ? 'phone' : 'email');

    if (user.favoriteSports && user.favoriteSports.length > 0) {
      this.selectedSports = [...user.favoriteSports];
    }
  }

  toggleSport(sportName: string) {
    if (this.selectedSports.includes(sportName)) {
      if (this.selectedSports.length > 1) {
        this.selectedSports = this.selectedSports.filter(s => s !== sportName);
      }
    } else {
      this.selectedSports.push(sportName);
    }
  }

  isSportSelected(sportName: string): boolean {
    return this.selectedSports.includes(sportName);
  }

  onSubmit() {
    this.errorMessage.set('');

    if (!this.fullName.trim()) {
      this.errorMessage.set('Please enter your full name.');
      return;
    }

    if (!this.location.trim()) {
      this.errorMessage.set('Please enter your city / location.');
      return;
    }

    if (this.loginChannel === 'phone' && !this.email.trim()) {
      this.errorMessage.set('Please provide a valid email address.');
      return;
    }

    if (this.loginChannel === 'email' && !this.phone.trim()) {
      this.errorMessage.set('Please provide a valid phone number.');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);

    const payload = {
      name: this.fullName.trim(),
      location: this.location.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      favoriteSports: this.selectedSports
    };

    this.apiService.updateUserProfile(payload, token).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.user) {
          this.apiService.currentUser.set(res.user);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || 'Failed to update profile details. Please try again.';
        this.errorMessage.set(msg);
      }
    });
  }
}
