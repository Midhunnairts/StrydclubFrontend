import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface ContactInfoItem {
  iconName: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent {
  private apiService = inject(ApiService);

  submitting = signal<boolean>(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  contactInfo = signal<ContactInfoItem[]>([
    {
      iconName: 'email',
      label: 'Email',
      value: 'strydclub@gmail.com'
    },
    {
      iconName: 'phone',
      label: 'Phone',
      value: '+91 8608159698'
    },
    {
      iconName: 'headquarters',
      label: 'Headquarters',
      value: 'Chennai, Tamil Nadu, India'
    },
    {
      iconName: 'social',
      label: 'Social',
      value: '@strydclub'
    }
  ]);

  formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  onSubmit() {
    this.successMsg.set(null);
    this.errorMsg.set(null);

    if (!this.formData.name || !this.formData.email || !this.formData.subject || !this.formData.message) {
      this.errorMsg.set('Please fill out all fields before sending your message.');
      return;
    }

    this.submitting.set(true);

    this.apiService.sendContactMessage(this.formData).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.successMsg.set(res.message || "Thank you for reaching out! We've received your message and will get back to you shortly.");
        // Reset form
        this.formData = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
      },
      error: (err) => {
        this.submitting.set(false);
        const msg = err.error?.message || 'Failed to send message. Please check your connection and try again.';
        this.errorMsg.set(msg);
      }
    });
  }
}
