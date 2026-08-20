import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface ScheduleItem {
  time: string;
  activity: string;
}

interface RuleItem {
  text: string;
}

@Component({
  selector: 'app-host-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './host-event.html',
  styleUrl: './host-event.scss'
})
export class HostEventComponent {
  private router = inject(Router);
  private apiService = inject(ApiService);

  currentStep = signal<number>(1);
  loading = signal<boolean>(false);

  // Sports Options Grid
  sportsOptions = [
    { name: 'Running', icon: '🏃' },
    { name: 'Badminton', icon: '🏸' },
    { name: 'Football', icon: '⚽' },
    { name: 'Volleyball', icon: '🏐' },
    { name: 'Pickleball', icon: '🏓' },
    { name: 'Kho Kho', icon: '🤸' },
    { name: 'Cricket', icon: '🏏' },
    { name: 'Other', icon: '✨' },
  ];

  // Stepper Form States
  selectedSport = signal<string>('');
  customSportName = signal<string>('');
  title = signal<string>('');
  description = signal<string>('');
  format = signal<string>('');
  skillLevel = signal<string>('');
  venueName = signal<string>('');
  city = signal<string>('');
  venueUrl = signal<string>('');
  rulesNotes = signal<string>('');
  price = signal<number>(0);

  date = signal<string>('');
  time = signal<string>('');
  endTime = signal<string>('');
  registrationCloses = signal<string>('');
  scheduleItems = signal<ScheduleItem[]>([
    { time: '5:30 AM', activity: 'Registration & Check-in' },
    { time: '5:50 AM', activity: 'Warm-up Session' },
    { time: '6:00 AM', activity: 'Event Commences' }
  ]);

  slotsTotal = signal<number>(30);
  playersPerTeam = signal<number | null>(null);
  prizePool = signal<number | null>(null);
  bannerUrl = signal<string>('');
  imageFileName = signal<string>('');
  imageFileSize = signal<string>('');
  isDragging = signal<boolean>(false);
  rules = signal<RuleItem[]>([
    { text: 'Participants must arrive 15 minutes prior to scheduling.' },
    { text: 'Proper athletic footwear and equipment are mandatory.' }
  ]);

  // Modal State
  showSuccessModal = signal<boolean>(false);

  // Step Validation Computeds
  isStep1Valid = computed(() => {
    const sport = this.selectedSport();
    if (!sport) return false;
    if (sport === 'Other') {
      return !!this.customSportName().trim();
    }
    return true;
  });
  isStep2Valid = computed(() => !!this.title().trim() && !!this.venueName().trim() && !!this.city().trim());
  isStep3Valid = computed(() => !!this.date() && !!this.time());
  isStep4Valid = computed(() => !!this.slotsTotal() && this.slotsTotal() > 0);

  isCurrentStepValid = computed(() => {
    switch (this.currentStep()) {
      case 1: return this.isStep1Valid();
      case 2: return this.isStep2Valid();
      case 3: return this.isStep3Valid();
      case 4: return this.isStep4Valid();
      case 5: return true;
      default: return false;
    }
  });

  selectSport(sport: string) {
    this.selectedSport.set(sport);
    if (sport !== 'Other') {
      this.customSportName.set('');
    }
  }

  getSportIcon(sportName: string): string {
    const found = this.sportsOptions.find(s => s.name === sportName);
    return found ? found.icon : '';
  }

  addScheduleItem() {
    this.scheduleItems.update(items => [...items, { time: '', activity: '' }]);
  }

  removeScheduleItem(index: number) {
    this.scheduleItems.update(items => items.filter((_, i) => i !== index));
  }

  addRule() {
    this.rules.update(items => [...items, { text: '' }]);
  }

  removeRule(index: number) {
    this.rules.update(items => items.filter((_, i) => i !== index));
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processImageFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.processImageFile(file);
      } else {
        alert('Please upload a valid image file (PNG, JPG, WebP).');
      }
    }
  }

  processImageFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size should be less than 10MB.');
      return;
    }

    this.imageFileName.set(file.name);
    const sizeKB = (file.size / 1024).toFixed(1);
    this.imageFileSize.set(file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKB} KB`);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const rawDataUrl = e.target.result as string;
        // Compress & resize image via HTML Canvas to avoid huge payloads
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            this.bannerUrl.set(compressedDataUrl);
          } else {
            this.bannerUrl.set(rawDataUrl);
          }
        };
        img.onerror = () => {
          this.bannerUrl.set(rawDataUrl);
        };
        img.src = rawDataUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.bannerUrl.set('');
    this.imageFileName.set('');
    this.imageFileSize.set('');
  }

  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  cancel() {
    this.router.navigate(['/events']);
  }

  onSubmit() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be signed in to perform this action.');
      this.router.navigate(['/login']);
      return;
    }

    this.loading.set(true);

    const payload = {
      title: this.title(),
      category: this.selectedSport() === 'Other' ? this.customSportName() : this.selectedSport(),
      description: this.description(),
      format: this.format() || 'Single Match',
      skillLevel: this.skillLevel() || 'Open',
      rulesNotes: this.rulesNotes(),
      date: this.formatDate(this.date()),
      time: this.formatTime(this.time()),
      endTime: this.endTime() ? this.formatTime(this.endTime()) : '',
      registrationCloses: this.registrationCloses() ? this.formatDate(this.registrationCloses()) : '',
      location: `${this.venueName()}, ${this.city()}`,
      venueUrl: this.venueUrl(),
      price: this.price(),
      slotsTotal: this.slotsTotal(),
      playersPerTeam: this.playersPerTeam() || 0,
      prizePool: this.prizePool() || 0,
      bannerUrl: this.bannerUrl(),
      rules: this.rules().filter(r => !!r.text.trim()),
      schedule: this.scheduleItems().filter(s => !!s.time.trim() && !!s.activity.trim())
    };

    this.apiService.createEvent(payload, token).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.showSuccessModal.set(true);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Server connection error during hosting';
        alert(errorMsg);
      }
    });
  }

  closeModal() {
    this.showSuccessModal.set(false);
    this.router.navigate(['/events']);
  }

  // Format HTML Date (YYYY-MM-DD) to Display Date (e.g. June 28, 2026)
  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  }

  // Format HTML Time (HH:MM) to Display Time (e.g. 6:00 AM)
  private formatTime(timeStr: string): string {
    if (!timeStr) return '';
    try {
      const [hoursStr, minutesStr] = timeStr.split(':');
      const hours = parseInt(hoursStr, 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutesStr} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  }
}
