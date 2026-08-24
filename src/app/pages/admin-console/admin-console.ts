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

  // Overview metrics (initialized to 0)
  stats = signal({
    totalEvents: 0,
    registeredUsers: 0,
    activeNow: 0,
    avgFillRate: '0%',
    pendingCount: 0,
    eventsTrend: '0 this month',
    usersTrend: '0 this month',
    activeTrend: 'Active users',
    fillRateTrend: 'Fill rate'
  });

  // Approval queue (populated from API)
  approvalQueue = signal<ApprovalItem[]>([]);

  // Highlights (populated from API)
  highlights = signal({
    topSport: { name: 'None', subtext: '0 registrations', icon: '🏃' },
    hottestCity: { name: 'None', subtext: '0 active events', icon: '📍' },
    revenue: { value: '₹0', subtext: 'No revenue recorded' }
  });

  // Recent activity feed (populated from API)
  recentActivity = signal<ActivityItem[]>([]);

  // Full Events and Users for Tabs
  allEvents = signal<any[]>([]);
  allUsers = signal<any[]>([]);

  // Analytics Data matching screenshot
  analyticsData = signal({
    monthlyEvents: [
      { month: 'Jan', count: 12, heightPct: 32 },
      { month: 'Feb', count: 18, heightPct: 47 },
      { month: 'Mar', count: 24, heightPct: 63 },
      { month: 'Apr', count: 31, heightPct: 81 },
      { month: 'May', count: 28, heightPct: 73 },
      { month: 'Jun', count: 38, heightPct: 100 }
    ],
    topSports: [
      { name: 'Running', count: 42, widthPct: 84 },
      { name: 'Football', count: 28, widthPct: 56 },
      { name: 'Badminton', count: 24, widthPct: 48 },
      { name: 'Volleyball', count: 18, widthPct: 36 },
      { name: 'Pickleball', count: 14, widthPct: 28 },
      { name: 'Padel', count: 9, widthPct: 18 }
    ],
    topCities: [
      { rank: 1, name: 'Bangalore', count: 28 },
      { rank: 2, name: 'Mumbai', count: 21 },
      { rank: 3, name: 'Delhi', count: 18 },
      { rank: 4, name: 'Pune', count: 12 },
      { rank: 5, name: 'Chennai', count: 9 },
      { rank: 6, name: 'Hyderabad', count: 8 },
      { rank: 7, name: 'Goa', count: 5 }
    ]
  });

  // Search queries for tab filters
  eventSearchQuery = '';
  userSearchQuery = '';
  eventStatusFilter = 'all';

  ngOnInit() {
    this.loadAdminData();
  }

  setTab(tab: 'overview' | 'events' | 'users' | 'analytics') {
    this.activeTab.set(tab);
    if (tab === 'events') {
      this.loadAdminEvents();
    } else if (tab === 'users') {
      this.loadAdminUsers();
    } else if (tab === 'analytics') {
      this.loadAdminAnalytics();
    }
  }

  loadAdminAnalytics() {
    this.apiService.getAdminAnalytics().subscribe({
      next: (res) => {
        if (res.success && res.analytics) {
          this.analyticsData.set(res.analytics);
        }
      },
      error: () => {}
    });
  }

  loadAdminData() {
    this.loading.set(true);
    this.apiService.getAdminOverview().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          if (res.stats) this.stats.set(res.stats);
          this.approvalQueue.set(res.approvalQueue || []);
          if (res.highlights) this.highlights.set(res.highlights);
          this.recentActivity.set(res.recentActivity || []);
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
        if (res.success) {
          this.allEvents.set(res.events || []);
        }
      },
      error: () => {
        this.allEvents.set([]);
      }
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
