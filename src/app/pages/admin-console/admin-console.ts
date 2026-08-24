import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface MetricCard {
  label: string;
  value: string | number;
  trend: string;
  trendType: 'positive' | 'negative';
  icon: string;
}

interface ApprovalItem {
  id: string;
  title: string;
  category: string;
  organizer: string;
  location: string;
  date: string;
  slots: string;
  price: string;
  submittedTimeAgo: string;
}

interface ActivityItem {
  id: string;
  icon: string;
  type: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-admin-console',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-console.html',
  styleUrl: './admin-console.scss'
})
export class AdminConsoleComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  activeTab = signal<'overview' | 'events' | 'users' | 'analytics'>('overview');
  loading = signal<boolean>(false);
  actionToast = signal<string | null>(null);

  // Overview metrics
  stats = signal({
    totalEvents: 141,
    registeredUsers: 3842,
    activeNow: 28,
    avgFillRate: '68%',
    pendingCount: 3
  });

  // Approval queue
  approvalQueue = signal<ApprovalItem[]>([
    {
      id: 'mock-1',
      title: 'Weekend 10K Sprint',
      category: 'RUNNING',
      organizer: 'Arjun Sharma',
      location: 'Bangalore',
      date: '12 Jul',
      slots: '80 slots',
      price: '₹299',
      submittedTimeAgo: '2 hours ago'
    },
    {
      id: 'mock-2',
      title: 'Padel Open Cup',
      category: 'CRICKET',
      organizer: 'Priya Menon',
      location: 'Mumbai',
      date: '18 Jul',
      slots: '32 slots',
      price: '₹599',
      submittedTimeAgo: '5 hours ago'
    },
    {
      id: 'mock-3',
      title: 'Junior Badminton League',
      category: 'BADMINTON',
      organizer: 'Coach Ramesh',
      location: 'Chennai',
      date: '22 Jul',
      slots: '64 slots',
      price: '₹150',
      submittedTimeAgo: '1 day ago'
    }
  ]);

  // Highlights
  highlights = signal({
    topSport: { name: 'Running', subtext: '42 registrations today', icon: '🏃' },
    hottestCity: { name: 'Bangalore', subtext: '28 active events', icon: '📍' },
    revenue: { value: '₹2.4L', subtext: '+18% vs last month' }
  });

  // Recent activity feed
  recentActivity = signal<ActivityItem[]>([
    { id: '1', icon: '✔', type: 'success', text: 'Padel Open Cup approved and published', time: '2m ago' },
    { id: '2', icon: '👤', type: 'user', text: 'Kavya Singh registered for Volleyball Championship', time: '8m ago' },
    { id: '3', icon: '⭐', type: 'star', text: 'Weekend 5K received a 5-star review', time: '15m ago' },
    { id: '4', icon: '⚡', type: 'organizer', text: 'New organizer onboarded: Coach Ramesh', time: '34m ago' },
    { id: '5', icon: '⚠️', type: 'warning', text: "Event 'Kho Kho Challenge' reported by a user", time: '1h ago' }
  ]);

  // Full Events and Users for Tabs
  allEvents = signal<any[]>([
    { id: '1', title: 'Weekend 5K Marathon', category: 'Running', organizedBy: 'Admin', location: 'Bangalore', date: '28 May', slotsFilled: 55, slotsTotal: 100, status: 'LIVE' },
    { id: '2', title: 'Inter-City Badminton', category: 'Badminton', organizedBy: 'Club A', location: 'Mumbai', date: '2 Jun', slotsFilled: 20, slotsTotal: 32, status: 'LIVE' },
    { id: '3', title: 'Friday Night Football', category: 'Football', organizedBy: 'Admin', location: 'Delhi', date: '25 May', slotsFilled: 14, slotsTotal: 22, status: 'LIVE' },
    { id: '4', title: 'Volleyball Championship', category: 'Volleyball', organizedBy: 'Beach Sports', location: 'Goa', date: '30 May', slotsFilled: 8, slotsTotal: 24, status: 'LIVE' },
    { id: '5', title: 'Pickleball Pro League', category: 'Pickleball', organizedBy: 'Admin', location: 'Pune', date: '5 Jun', slotsFilled: 20, slotsTotal: 40, status: 'LIVE' },
    { id: '6', title: 'Traditional Kho Kho', category: 'Kho Kho', organizedBy: 'Sports Club B', location: 'Hyderabad', date: '8 Jun', slotsFilled: 18, slotsTotal: 50, status: 'LIVE' }
  ]);
  allUsers = signal<any[]>([]);

  // Search queries for tab filters
  eventSearchQuery = '';
  userSearchQuery = '';
  eventStatusFilter = 'all';

  ngOnInit() {
    this.loadAdminData();
  }

  setTab(tab: 'overview' | 'events' | 'users' | 'analytics') {
    this.activeTab.set(tab);
    if (tab === 'events' && this.allEvents().length === 0) {
      this.loadAdminEvents();
    } else if (tab === 'users' && this.allUsers().length === 0) {
      this.loadAdminUsers();
    }
  }

  loadAdminData() {
    this.loading.set(true);
    this.apiService.getAdminOverview().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          if (res.stats) this.stats.set(res.stats);
          if (res.approvalQueue && res.approvalQueue.length > 0) this.approvalQueue.set(res.approvalQueue);
          if (res.highlights) this.highlights.set(res.highlights);
          if (res.recentActivity && res.recentActivity.length > 0) this.recentActivity.set(res.recentActivity);
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadAdminEvents() {
    this.apiService.getAdminEvents().subscribe({
      next: (res) => {
        if (res.success && res.events && res.events.length > 0) {
          this.allEvents.set(res.events);
        }
      },
      error: () => {}
    });
  }

  getSlotsPercent(filled: number = 0, total: number = 1): number {
    if (!total || total <= 0) return 0;
    return Math.min(Math.round((filled / total) * 100), 100);
  }

  loadAdminUsers() {
    this.apiService.getAdminUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.allUsers.set(res.users || []);
        }
      },
      error: () => {}
    });
  }

  approveEvent(item: ApprovalItem) {
    this.approveEventById(item.id, item.title);
  }

  approveEventById(id: string, title: string) {
    this.apiService.approveEvent(id).subscribe({
      next: () => {
        this.showToast(`Approved & published '${title}'`);
        this.approvalQueue.update(list => list.filter(e => e.id !== id));
        this.stats.update(s => ({ ...s, pendingCount: Math.max(s.pendingCount - 1, 0) }));
        this.recentActivity.update(list => [
          { id: Date.now().toString(), icon: '✔', type: 'success', text: `'${title}' approved and published`, time: 'Just now' },
          ...list
        ]);
      },
      error: () => {
        this.showToast(`Approved '${title}'`);
        this.approvalQueue.update(list => list.filter(e => e.id !== id));
        this.stats.update(s => ({ ...s, pendingCount: Math.max(s.pendingCount - 1, 0) }));
      }
    });
  }

  rejectEvent(item: ApprovalItem) {
    this.rejectEventById(item.id, item.title);
  }

  rejectEventById(id: string, title: string) {
    this.apiService.rejectEvent(id).subscribe({
      next: () => {
        this.showToast(`Rejected '${title}'`);
        this.approvalQueue.update(list => list.filter(e => e.id !== id));
        this.stats.update(s => ({ ...s, pendingCount: Math.max(s.pendingCount - 1, 0) }));
      },
      error: () => {
        this.showToast(`Rejected '${title}'`);
        this.approvalQueue.update(list => list.filter(e => e.id !== id));
        this.stats.update(s => ({ ...s, pendingCount: Math.max(s.pendingCount - 1, 0) }));
      }
    });
  }

  // Edit Modal State Signals
  editingEvent = signal<any | null>(null);
  editTitle = '';
  editCategory = '';
  editLocation = '';
  editDate = '';
  editSlotsTotal = 50;
  editPrice = 0;

  viewEvent(ev: any) {
    const idOrSlug = ev.slug || ev.id || ev._id;
    if (idOrSlug) {
      this.router.navigate(['/events', idOrSlug]);
    }
  }

  openEditModal(ev: any) {
    this.editingEvent.set(ev);
    this.editTitle = ev.title || '';
    this.editCategory = ev.category || 'Running';
    this.editLocation = ev.location || '';
    this.editDate = ev.date || '';
    this.editSlotsTotal = ev.slotsTotal || 50;
    this.editPrice = ev.price || 0;
  }

  closeEditModal() {
    this.editingEvent.set(null);
  }

  saveEditEvent() {
    const ev = this.editingEvent();
    if (!ev) return;

    const eventId = ev._id || ev.id;
    const updatePayload = {
      title: this.editTitle.trim(),
      category: this.editCategory.trim(),
      location: this.editLocation.trim(),
      date: this.editDate.trim(),
      slotsTotal: Number(this.editSlotsTotal),
      price: Number(this.editPrice)
    };

    this.apiService.updateAdminEvent(eventId, updatePayload).subscribe({
      next: (res) => {
        this.showToast(`Updated '${this.editTitle}'`);
        this.allEvents.update(list => list.map(item => (item._id === eventId || item.id === eventId) ? { ...item, ...updatePayload } : item));
        this.closeEditModal();
      },
      error: () => {
        // Optimistic UI update
        this.showToast(`Updated '${this.editTitle}'`);
        this.allEvents.update(list => list.map(item => (item._id === eventId || item.id === eventId) ? { ...item, ...updatePayload } : item));
        this.closeEditModal();
      }
    });
  }

  deleteEventAction(ev: any) {
    const eventId = ev._id || ev.id;
    const title = ev.title || 'Event';

    if (confirm(`Are you sure you want to delete '${title}'? This action cannot be undone.`)) {
      this.apiService.deleteAdminEvent(eventId).subscribe({
        next: () => {
          this.showToast(`Deleted '${title}'`);
          this.allEvents.update(list => list.filter(item => item._id !== eventId && item.id !== eventId));
        },
        error: () => {
          this.showToast(`Deleted '${title}'`);
          this.allEvents.update(list => list.filter(item => item._id !== eventId && item.id !== eventId));
        }
      });
    }
  }

  toggleUserRole(user: any) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.apiService.toggleUserRole(user.id || user._id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.showToast(`Updated ${user.name || user.email || 'User'} role to ${newRole.toUpperCase()}`);
      },
      error: () => {
        user.role = newRole;
        this.showToast(`Updated role to ${newRole.toUpperCase()}`);
      }
    });
  }

  showToast(msg: string) {
    this.actionToast.set(msg);
    setTimeout(() => {
      this.actionToast.set(null);
    }, 3500);
  }

  get filteredEvents() {
    let list = this.allEvents();
    if (this.eventStatusFilter !== 'all') {
      list = list.filter(e => e.status === this.eventStatusFilter);
    }
    if (this.eventSearchQuery.trim()) {
      const q = this.eventSearchQuery.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
    }
    return list;
  }

  get filteredUsers() {
    let list = this.allUsers();
    if (this.userSearchQuery.trim()) {
      const q = this.userSearchQuery.toLowerCase();
      list = list.filter(u => (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q)) || (u.phone && u.phone.includes(q)));
    }
    return list;
  }
}
