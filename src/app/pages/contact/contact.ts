import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    console.log('Form submitted:', this.formData);
  }
}
