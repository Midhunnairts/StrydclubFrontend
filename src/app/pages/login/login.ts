import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  activeTab = signal<'phone' | 'email'>('phone');

  phoneNumber = '';
  emailAddress = '';

  setTab(tab: 'phone' | 'email') {
    this.activeTab.set(tab);
  }

  onSubmit() {
    if (this.activeTab() === 'phone') {
      console.log('Sending OTP to Phone:', this.phoneNumber);
    } else {
      console.log('Sending OTP to Email:', this.emailAddress);
    }
  }

  loginWithGoogle() {
    console.log('Logging in with Google...');
  }
}
