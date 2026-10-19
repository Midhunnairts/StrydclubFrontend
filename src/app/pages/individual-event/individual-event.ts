import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

declare var Cashfree: any;

interface RuleItem {
  text: string;
}

interface ScheduleItem {
  time: string;
  activity: string;
}

interface ParticipantItem {
  userId?: string;
  name: string;
  role: string;
  surfingSlot?: number;
  surfingSlotTime?: string;
}

interface SurfingSlotItem {
  slotNumber: number;
  time: string;
  endTime?: string;
  maxAttendees?: number;
  slotsFilled?: number;
}

interface EventDetails {
  id: string;
  slug?: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  status: string;
  price: number;
  slotsFilled: number;
  slotsTotal: number;
  rulesNotes?: string;
  rules: RuleItem[];
  schedule: ScheduleItem[];
  participants: ParticipantItem[];
  organizedBy: string;
  contact: string;
  venueUrl?: string;
  bannerUrl?: string;
  isRegistered?: boolean;
  surfingSlots?: SurfingSlotItem[];
}

@Component({
  selector: 'app-individual-event',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './individual-event.html',
  styleUrl: './individual-event.scss'
})
export class IndividualEventComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  private allEvents: EventDetails[] = [];

  // Set initial loading state to null
  eventDetails = signal<EventDetails | null>(null);

  ngOnInit() {
    this.loadEventDetails();
    this.checkRedirectPaymentVerification();
  }

  checkRedirectPaymentVerification() {
    const routeId = this.route.snapshot.paramMap.get('id');
    const urlOrderId = this.route.snapshot.queryParamMap.get('order_id');
    const token = this.apiService.getToken();

    let pendingOrder: any = null;
    try {
      const stored = localStorage.getItem('stryd_pending_order');
      if (stored) {
        pendingOrder = JSON.parse(stored);
      }
    } catch (e) {}

    const orderIdToVerify = urlOrderId || pendingOrder?.orderId;
    const targetEventId = routeId || pendingOrder?.eventId;
    const slotPayload = pendingOrder?.slotPayload || {};

    if (orderIdToVerify && targetEventId) {
      if (urlOrderId) {
        this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
      }

      this.isProcessing.set(true);
      this.processingText.set('Verifying payment & securing spot...');

      this.apiService.verifyCashfreePayment(targetEventId, { order_id: orderIdToVerify, ...slotPayload }, token).subscribe({
        next: (verifyRes) => {
          this.isProcessing.set(false);
          try { localStorage.removeItem('stryd_pending_order'); } catch (e) {}
          if (verifyRes.success) {
            this.modalState.set({
              show: true,
              title: 'Registration Successful!',
              message: verifyRes.message || 'Payment verified successfully. You have secured your spot for this event!',
              type: 'success'
            });
            this.loadEventDetails();
          }
        },
        error: (verifyErr) => {
          this.isProcessing.set(false);
          if (verifyErr?.error?.alreadyRegistered) {
            try { localStorage.removeItem('stryd_pending_order'); } catch (e) {}
            this.loadEventDetails();
          } else if (pendingOrder && Date.now() - pendingOrder.timestamp > 30 * 60 * 1000) {
            // Expire after 30 minutes
            try { localStorage.removeItem('stryd_pending_order'); } catch (e) {}
          }
          console.warn('Cashfree payment verification note:', verifyErr.error?.message);
        }
      });
    }
  }

  loadEventDetails() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getEventDetails(id)
        .subscribe({
          next: (res) => {
            if (res.success) {
              const defaultCategoryImages: Record<string, string> = {
                'Running': '/assets/Run.jpg',
                'Badminton': '/assets/Badminton.jpg',
                'Football': '/assets/Football.jpg',
                'Volleyball': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
                'Pickleball': '/assets/Pickleball.webp',
                'Lifestyle': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
                'Surfing': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80',
                'Other': '/assets/Other.jpg'
              };
              const mapped: EventDetails = {
                id: res.event._id || res.event.id || (res.event as any).slug || '',
                title: res.event.title,
                category: res.event.category,
                description: res.event.description,
                date: res.event.date,
                time: res.event.time,
                endTime: res.event.endTime || '',
                location: res.event.location,
                status: res.event.status,
                price: res.event.price,
                slotsFilled: res.event.slotsFilled,
                slotsTotal: res.event.slotsTotal,
                rulesNotes: res.event.rulesNotes || '',
                rules: res.event.rules || [],
                schedule: res.event.schedule || [],
                participants: res.event.participants || [],
                organizedBy: res.event.organizedBy,
                contact: res.event.contact,
                venueUrl: res.event.venueUrl || '',
                bannerUrl: res.event.bannerUrl || res.event.image || defaultCategoryImages[res.event.category] || '/assets/Other.jpg',
                isRegistered: Boolean(res.event.isRegistered),
                surfingSlots: res.event.surfingSlots || []
              };
              this.eventDetails.set(mapped);
            }
          },
          error: () => {
            this.eventDetails.set(null);
          }
        });
    }
  }

  isEventCompleted = computed(() => {
    const details = this.eventDetails();
    if (!details) return false;
    if (details.status === 'Completed' || details.status === 'completed' || details.status === 'Event Completed') {
      return true;
    }
    return this.isEventPast(details.date, details.time, details.endTime);
  });

  isAlreadyRegistered = computed(() => {
    const details = this.eventDetails();
    if (!details) return false;

    if (details.isRegistered) return true;

    const user = this.apiService.currentUser();
    if (!user) return false;

    if (details.participants && Array.isArray(details.participants)) {
      return details.participants.some((p: any) => {
        if (p.userId && (p.userId === user.id || p.userId === user._id)) return true;
        if (user.name && user.name.trim() !== '' && p.name === user.name) return true;
        if (user.phone && user.phone.trim() !== '' && p.name === user.phone) return true;
        if (user.email && user.email.trim() !== '' && p.name === user.email) return true;
        return false;
      });
    }
    return false;
  });

  isAdmin = computed(() => {
    const user = this.apiService.currentUser();
    return user ? user.role === 'admin' : false;
  });

  showParticipants = computed(() => {
    return this.isAlreadyRegistered() || this.isAdmin() || this.isSurfingEvent();
  });

  modalState = signal<{
    show: boolean;
    title: string;
    message: string;
    type: 'auth' | 'success' | 'confirm_cancel';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'auth'
  });

  isProcessing = signal<boolean>(false);
  processingText = signal<string>('Processing your request...');

  copied = signal<boolean>(false);

  closeModal() {
    this.modalState.update(state => ({ ...state, show: false }));
  }

  confirmModalAction() {
    const type = this.modalState().type;
    const title = this.modalState().title;
    this.closeModal();
    if (type === 'auth') {
      this.router.navigate(['/login']);
    } else if (type === 'success') {
      if (title !== 'Registration Cancelled') {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  isEventPast(dateStr?: string, timeStr?: string, endTimeStr?: string): boolean {
    if (!dateStr) return false;
    const cleanDate = dateStr.trim();
    let targetTime = endTimeStr && endTimeStr.trim() ? endTimeStr.trim() : '';

    if (!targetTime && timeStr) {
      const rangeMatch = timeStr.match(/(?:-|to|–)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i);
      if (rangeMatch) {
        targetTime = rangeMatch[1].trim();
      } else {
        targetTime = timeStr.trim();
      }
    }

    const parseTimeParts = (tStr: string) => {
      const m = tStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!m) return null;
      let hours = parseInt(m[1], 10);
      const minutes = m[2] ? parseInt(m[2], 10) : 0;
      const ampm = m[3] ? m[3].toUpperCase() : null;
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    };

    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      const parts = cleanDate.split('-').map(Number);
      d = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      d = new Date(cleanDate);
    }
    if (isNaN(d.getTime())) return false;

    const timeParts = targetTime ? parseTimeParts(targetTime) : null;
    if (timeParts) {
      d.setHours(timeParts.hours, timeParts.minutes, 0, 0);
      if (!endTimeStr || !endTimeStr.trim()) {
        d.setHours(d.getHours() + 1);
      }
    } else {
      d.setHours(23, 59, 59, 999);
    }

    return d < new Date();
  }

  showSurfingSlotModal = signal<boolean>(false);
  selectedSurfingSlot = signal<SurfingSlotItem | null>(null);

  closeSurfingSlotModal() {
    this.showSurfingSlotModal.set(false);
  }

  selectSurfingSlot(slot: SurfingSlotItem) {
    if (this.isSlotFull(slot)) return;
    this.selectedSurfingSlot.set(slot);
  }

  onSelectSlotFromPage(slot: SurfingSlotItem) {
    if (this.isAlreadyRegistered() || this.isEventCompleted()) return;
    this.selectSurfingSlot(slot);
    this.onRegister();
  }

  confirmSlotAndProceed() {
    if (!this.selectedSurfingSlot()) return;
    this.showSurfingSlotModal.set(false);
    this.proceedWithRegistration();
  }

  onRegister() {
    const details = this.eventDetails();
    if (!details) return;

    if (this.isEventCompleted()) {
      alert('This event has already concluded.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.modalState.set({
        show: true,
        title: 'Sign In Required',
        message: 'You need to be signed in to register for upcoming sports events. Sign in now to claim your spot!',
        type: 'auth'
      });
      return;
    }

    if (this.isSurfingEvent()) {
      const slots = this.getEventSurfingSlots();
      if (!this.selectedSurfingSlot() && slots.length > 0) {
        const available = slots.find(s => !this.isSlotFull(s)) || slots[0];
        this.selectedSurfingSlot.set(available);
      }
      this.showSurfingSlotModal.set(true);
      return;
    }

    this.proceedWithRegistration();
  }

  proceedWithRegistration() {
    const details = this.eventDetails();
    if (!details) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const selectedSlot = this.selectedSurfingSlot();
    const slotPayload = selectedSlot ? {
      surfingSlot: selectedSlot.slotNumber,
      surfingSlotTime: this.getSlotDisplayTiming(selectedSlot)
    } : {};

    if (details.price && details.price > 0) {
      this.isProcessing.set(true);
      this.processingText.set('Preparing Cashfree checkout...');

      this.apiService.createCashfreeOrder(details.id, token, slotPayload).subscribe({
        next: (orderRes) => {
          this.isProcessing.set(false);
          if (orderRes.success && orderRes.payment_session_id) {
            const pendingOrder = {
              orderId: orderRes.order_id,
              eventId: details.id,
              slug: details.slug,
              slotPayload: slotPayload,
              timestamp: Date.now()
            };
            try {
              localStorage.setItem('stryd_pending_order', JSON.stringify(pendingOrder));
            } catch (e) {}

            try {
              const cashfreeMode = orderRes.cf_environment || environment.cashfreeEnv || 'sandbox';
              const cashfree = Cashfree({ mode: cashfreeMode });

              const checkoutOptions = {
                paymentSessionId: orderRes.payment_session_id,
                redirectTarget: '_modal'
              };

              cashfree.checkout(checkoutOptions).then((result: any) => {
                if (result && result.error) {
                  console.warn('Cashfree payment modal closed or error:', result.error);
                }

                // Verify Cashfree payment status with backend
                this.isProcessing.set(true);
                this.processingText.set('Verifying Cashfree payment & securing spot...');

                this.apiService.verifyCashfreePayment(details.id, { order_id: orderRes.order_id, ...slotPayload }, token).subscribe({
                  next: (verifyRes) => {
                    this.isProcessing.set(false);
                    try { localStorage.removeItem('stryd_pending_order'); } catch (e) {}
                    if (verifyRes.success) {
                      const slotNotice = selectedSlot ? ` for Slot ${selectedSlot.slotNumber} (${this.getSlotDisplayTiming(selectedSlot)})` : '';
                      this.modalState.set({
                        show: true,
                        title: 'Registration Successful!',
                        message: `Cashfree payment verified successfully. You have secured your spot${slotNotice}!`,
                        type: 'success'
                      });
                      this.loadEventDetails();
                    }
                  },
                  error: (verifyErr) => {
                    this.isProcessing.set(false);
                    if (verifyErr?.error?.alreadyRegistered) {
                      try { localStorage.removeItem('stryd_pending_order'); } catch (e) {}
                      this.modalState.set({
                        show: true,
                        title: 'Registration Confirmed!',
                        message: 'You are confirmed for this event.',
                        type: 'success'
                      });
                      this.loadEventDetails();
                    } else {
                      const errorMsg = verifyErr.error?.message || 'Cashfree payment verification failed. If money was debited, your spot will be synced automatically on refresh.';
                      alert(errorMsg);
                    }
                  }
                });
              });
            } catch (sdkErr) {
              console.warn('Cashfree SDK modal fallback, verifying order:', sdkErr);
              // Direct payment verification fallback
              this.isProcessing.set(true);
              this.processingText.set('Verifying Cashfree payment...');
              this.apiService.verifyCashfreePayment(details.id, { order_id: orderRes.order_id, ...slotPayload }, token).subscribe({
                next: (verifyRes) => {
                  this.isProcessing.set(false);
                  try { localStorage.removeItem('stryd_pending_order'); } catch (e) {}
                  if (verifyRes.success) {
                    const slotNotice = selectedSlot ? ` for Slot ${selectedSlot.slotNumber} (${this.getSlotDisplayTiming(selectedSlot)})` : '';
                    this.modalState.set({
                      show: true,
                      title: 'Registration Successful!',
                      message: `Cashfree payment verified successfully${slotNotice}!`,
                      type: 'success'
                    });
                    this.loadEventDetails();
                  }
                },
                error: (verifyErr) => {
                  this.isProcessing.set(false);
                  if (verifyErr?.error?.alreadyRegistered) {
                    try { localStorage.removeItem('stryd_pending_order'); } catch (e) {}
                    this.loadEventDetails();
                  } else {
                    alert(verifyErr.error?.message || 'Cashfree payment verification failed.');
                  }
                }
              });
            }
          }
        },
        error: (orderErr) => {
          this.isProcessing.set(false);
          const errorMsg = orderErr.error?.message || 'Failed to create Cashfree payment order.';
          alert(errorMsg);
        }
      });
    } else {
      this.isProcessing.set(true);
      this.processingText.set('Securing your event spot...');

      this.apiService.registerForEvent(details.id, token, slotPayload).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          if (res.success) {
            const slotNotice = selectedSlot ? ` for Slot ${selectedSlot.slotNumber} (${this.getSlotDisplayTiming(selectedSlot)})` : '';
            this.modalState.set({
              show: true,
              title: 'Registration Successful!',
              message: `You have successfully secured your spot${slotNotice}. View and track your schedule on your dashboard.`,
              type: 'success'
            });
            this.loadEventDetails();
          }
        },
        error: (err) => {
          this.isProcessing.set(false);
          const errorMsg = err.error?.message || 'Server connection error during registration';
          alert(errorMsg);
        }
      });
    }
  }

  onCancelRegistration() {
    const details = this.eventDetails();
    if (!details) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.modalState.set({
      show: true,
      title: 'Cancel Registration?',
      message: `Are you sure you want to cancel your spot for "${details.title}"? ${details.price > 0
        ? `Your registration fee of ₹${details.price} will be refunded back to your original payment method.`
        : 'Your reserved slot will be released instantly.'
        }`,
      type: 'confirm_cancel'
    });
  }

  executeCancelRegistration() {
    const details = this.eventDetails();
    if (!details) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    this.closeModal();

    this.isProcessing.set(true);
    this.processingText.set(
      details.price > 0 ? 'Processing Cashfree refund & releasing slot...' : 'Cancelling event registration...'
    );

    this.apiService.cancelEventRegistration(details.id, token).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        if (res.success) {
          this.modalState.set({
            show: true,
            title: 'Registration Cancelled',
            message: res.message || 'Your registration has been cancelled successfully. Your slot has been released.',
            type: 'success'
          });
          // Reload to show updated slotsFilled count & participants roster!
          this.loadEventDetails();
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        const errorMsg = err.error?.message || 'Server connection error during cancellation';
        alert(errorMsg);
      }
    });
  }

  onEditEvent() {
    const details = this.eventDetails();
    if (!details) return;
    this.router.navigate(['/host-event'], { queryParams: { editId: details.id } });
  }

  onShare() {
    const details = this.eventDetails();
    if (!details) return;

    const shareData = {
      title: details.title,
      text: `Check out this event on Strydclub: ${details.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          console.log('Successfully shared event via Web Share API');
        })
        .catch((err) => {
          console.warn('Error sharing event:', err);
        });
    } else {
      this.copyLinkToClipboard();
    }
  }

  onCopyLink() {
    this.copyLinkToClipboard();
  }

  private copyLinkToClipboard() {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.copied.set(true);
        setTimeout(() => {
          this.copied.set(false);
        }, 2000);
      }).catch((err) => {
        console.error('Failed to copy link to clipboard:', err);
        alert('Could not copy link automatically. Please copy the URL from your browser address bar.');
      });
    } else {
      alert('Clipboard access not supported in your browser.');
    }
  }

  isSurfingEvent(): boolean {
    const details = this.eventDetails();
    if (!details) return false;
    return details.category.toLowerCase() === 'surfing' || (!!details.surfingSlots && details.surfingSlots.length > 0);
  }

  getEventSurfingSlots(): SurfingSlotItem[] {
    const details = this.eventDetails();
    if (!details) return [];
    if (details.surfingSlots && details.surfingSlots.length > 0) {
      return details.surfingSlots;
    }
    if (details.category.toLowerCase() === 'surfing') {
      return [
        { slotNumber: 1, time: '6:30 AM', endTime: '8:15 AM', maxAttendees: 10, slotsFilled: 0 },
        { slotNumber: 2, time: '8:30 AM', endTime: '10:15 AM', maxAttendees: 10, slotsFilled: 0 }
      ];
    }
    return [];
  }

  getSlotFilledCount(slot: SurfingSlotItem): number {
    const participantsInSlot = this.getSlotParticipants(slot.slotNumber);
    if (participantsInSlot.length > 0) {
      return Math.max(participantsInSlot.length, slot.slotsFilled || 0);
    }
    return slot.slotsFilled !== undefined ? slot.slotsFilled : 0;
  }

  getSlotSpotsLeft(slot: SurfingSlotItem): string {
    const max = slot.maxAttendees || 10;
    const filled = this.getSlotFilledCount(slot);
    const left = Math.max(0, max - filled);
    if (left === 0) return 'Fully booked';
    return `${left} spots left`;
  }

  getSlotSpotsLeftText(slot: SurfingSlotItem): string {
    const max = slot.maxAttendees || 10;
    const filled = this.getSlotFilledCount(slot);
    const left = Math.max(0, max - filled);
    return `${left} of ${max} spots left`;
  }

  isSlotAlmostFull(slot: SurfingSlotItem): boolean {
    const max = slot.maxAttendees || 10;
    const filled = this.getSlotFilledCount(slot);
    const left = Math.max(0, max - filled);
    return left > 0 && left <= 3;
  }

  isSlotFull(slot: SurfingSlotItem): boolean {
    const max = slot.maxAttendees || 10;
    const filled = this.getSlotFilledCount(slot);
    return max - filled <= 0;
  }

  getSlotStatusText(slot: SurfingSlotItem): string {
    if (this.isSlotFull(slot)) return 'Fully booked';
    if (this.isSlotAlmostFull(slot)) return 'Almost full';
    return 'Available';
  }

  getSlotDisplayTiming(slot: SurfingSlotItem): string {
    if (!slot || !slot.time) return '';
    if (slot.endTime) {
      return `${slot.time} – ${slot.endTime}`;
    }
    if (slot.time.includes('–') || slot.time.includes('-')) {
      return slot.time;
    }
    try {
      const timeClean = slot.time.trim();
      const match = timeClean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        let mins = parseInt(match[2], 10);
        const ampm = match[3]?.toUpperCase();
        let startHours24 = hours;
        if (ampm === 'PM' && hours < 12) startHours24 += 12;
        if (ampm === 'AM' && hours === 12) startHours24 = 0;

        let endMinsTotal = startHours24 * 60 + mins + 105;
        let endHours24 = Math.floor(endMinsTotal / 60) % 24;
        let endMins = endMinsTotal % 60;

        const endAmpm = endHours24 >= 12 ? 'PM' : 'AM';
        const endHours12 = endHours24 % 12 || 12;
        const endFormatted = `${endHours12}:${String(endMins).padStart(2, '0')} ${endAmpm}`;

        const startAmpm = startHours24 >= 12 ? 'PM' : 'AM';
        const startHours12 = startHours24 % 12 || 12;
        const startFormatted = `${startHours12}:${String(mins).padStart(2, '0')} ${startAmpm}`;

        return `${startFormatted} – ${endFormatted}`;
      }
    } catch (e) {}
    return slot.time;
  }

  getSlotParticipants(slotNumber: number): ParticipantItem[] {
    const details = this.eventDetails();
    if (!details?.participants || !Array.isArray(details.participants)) return [];
    return details.participants.filter(p => {
      if (p.surfingSlot !== undefined && p.surfingSlot !== null) {
        return Number(p.surfingSlot) === Number(slotNumber);
      }
      return Number(slotNumber) === 1;
    });
  }

  getInitials(name?: string): string {
    if (!name || name.trim() === '') return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
