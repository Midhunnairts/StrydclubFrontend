import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

export interface ProfileData {
  id?: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  avatarUrl?: string;
  favoriteSports: string[];
  memberSince: string;
  totalEvents: number;
  eventsWon: number;
  sportsPlayed: number;
  points: number;
  rank: string;
  initials: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public apiService = inject(ApiService);

  activeTab = signal<'overview' | 'my-events' | 'edit-profile' | 'settings'>('overview');
  myEventsTab = signal<'registered' | 'past'>('registered');

  userProfile = signal<ProfileData | null>(null);
  registeredEvents = signal<any[]>([]);
  pastEvents = signal<any[]>([]);
  loading = signal<boolean>(true);
  saveLoading = signal<boolean>(false);
  saveMessage = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // Edit Form Fields
  editName = '';
  editBio = '';
  editLocation = '';
  editEmail = '';
  editPhone = '';
  editFavoriteSports: string[] = [];

  availableSports = [
    { name: 'Running', icon: '🏃' },
    { name: 'Badminton', icon: '🏸' },
    { name: 'Football', icon: '⚽' },
    { name: 'Volleyball', icon: '🏐' },
    { name: 'Pickleball', icon: '🎾' },
    { name: 'Kho Kho', icon: '🏹' },
    { name: 'Cricket', icon: '🏏' }
  ];

  winRatePercentage = computed(() => {
    const profile = this.userProfile();
    if (!profile || !profile.totalEvents || profile.totalEvents === 0) return 0;
    return Math.min(100, Math.round((profile.eventsWon / profile.totalEvents) * 100));
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'me') {
        this.loadPublicProfile(id);
      } else {
        this.loadCurrentProfile();
      }
    });
  }

  loadCurrentProfile() {
    this.loading.set(true);
    this.errorMsg.set(null);

    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      this.apiService.getUserProfile(token).subscribe({
        next: (res) => {
          if (res.success && res.user) {
            this.populateProfile(res.user);
          } else {
            this.userProfile.set(null);
          }
          this.loading.set(false);
        },
        error: () => {
          this.userProfile.set(null);
          this.loading.set(false);
        }
      });

      // Load registered & past events for user
      this.apiService.getUserDashboard(token).subscribe({
        next: (res) => {
          if (res.success) {
            this.registeredEvents.set(res.registeredEvents || []);
            this.pastEvents.set(res.pastParticipation || []);
          }
        },
        error: () => {}
      });
    } else {
      this.userProfile.set(null);
      this.loading.set(false);
    }
  }

  loadPublicProfile(id: string) {
    this.loading.set(true);
    this.apiService.getPublicUserProfile(id).subscribe({
      next: (res) => {
        if (res.success && res.user) {
          this.populateProfile(res.user);
        } else {
          this.userProfile.set(null);
        }
        this.loading.set(false);
      },
      error: () => {
        this.userProfile.set(null);
        this.loading.set(false);
      }
    });
  }

  populateProfile(user: any) {
    const name = user.name || 'Athlete';
    const initials = name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ST';

    const username = user.username || `@${name.toLowerCase().replace(/\s+/g, '')}_stryd`;
    const bio = user.bio || '';
    const location = user.location || '';
    const role = (user.role || 'USER').toUpperCase();

    const profileData: ProfileData = {
      id: user.id || user._id,
      name,
      username,
      bio,
      email: user.email || '',
      phone: user.phone || '',
      location,
      role,
      avatarUrl: user.avatarUrl,
      favoriteSports: user.favoriteSports || [],
      memberSince: user.memberSince || 'January 2026',
      totalEvents: user.totalEvents ?? 0,
      eventsWon: user.eventsWon ?? 0,
      sportsPlayed: user.sportsPlayed ?? 0,
      points: user.points ?? 0,
      rank: user.rank || '#--',
      initials
    };

    this.userProfile.set(profileData);

    // Sync Edit Form Fields
    this.editName = profileData.name;
    this.editBio = profileData.bio;
    this.editLocation = profileData.location;
    this.editEmail = profileData.email;
    this.editPhone = profileData.phone;
    this.editFavoriteSports = [...profileData.favoriteSports];
  }

  setTab(tab: 'overview' | 'my-events' | 'edit-profile' | 'settings') {
    this.activeTab.set(tab);
    this.saveMessage.set(null);
  }

  setMyEventsTab(tab: 'registered' | 'past') {
    this.myEventsTab.set(tab);
  }

  toggleSportEdit(sportName: string) {
    if (this.editFavoriteSports.includes(sportName)) {
      if (this.editFavoriteSports.length > 1) {
        this.editFavoriteSports = this.editFavoriteSports.filter(s => s !== sportName);
      }
    } else {
      this.editFavoriteSports.push(sportName);
    }
  }

  isSportEditSelected(sportName: string): boolean {
    return this.editFavoriteSports.includes(sportName);
  }

  onSaveProfile() {
    this.saveMessage.set(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      this.saveMessage.set('Logged out. Please log in again to save.');
      return;
    }

    this.saveLoading.set(true);

    const payload = {
      name: this.editName.trim(),
      bio: this.editBio.trim(),
      location: this.editLocation.trim(),
      email: this.editEmail.trim(),
      phone: this.editPhone.trim(),
      favoriteSports: this.editFavoriteSports
    };

    this.apiService.updateUserProfile(payload, token).subscribe({
      next: (res) => {
        this.saveLoading.set(false);
        if (res.success && res.user) {
          this.populateProfile(res.user);
          this.apiService.currentUser.set(res.user);
          this.saveMessage.set('Profile updated successfully!');
        } else {
          this.saveMessage.set('Profile updated.');
        }
      },
      error: (err) => {
        this.saveLoading.set(false);
        const msg = err.error?.message || 'Failed to update profile changes.';
        this.saveMessage.set(msg);
      }
    });
  }
}
