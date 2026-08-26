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
  name: string;
  role: string;
}

interface EventDetails {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  price: number;
  slotsFilled: number;
  slotsTotal: number;
  rules: RuleItem[];
  schedule: ScheduleItem[];
  participants: ParticipantItem[];
  organizedBy: string;
  contact: string;
  venueUrl?: string;
  bannerUrl?: string;
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
  }

  loadEventDetails() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.apiService.getEventDetails(id)
        .subscribe({
          next: (res) => {
            if (res.success) {
              const mapped: EventDetails = {
                id: res.event._id || res.event.id || (res.event as any).slug || '',
                title: res.event.title,
                category: res.event.category,
                description: res.event.description,
                date: res.event.date,
                time: res.event.time,
                location: res.event.location,
                status: res.event.status,
                price: res.event.price,
                slotsFilled: res.event.slotsFilled,
                slotsTotal: res.event.slotsTotal,
                rules: res.event.rules || [],
                schedule: res.event.schedule || [],
                participants: res.event.participants || [],
                organizedBy: res.event.organizedBy,
                contact: res.event.contact,
                venueUrl: res.event.venueUrl || '',
                bannerUrl: res.event.bannerUrl || ''
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

  isAlreadyRegistered = computed(() => {
    const details = this.eventDetails();
    if (!details) return false;

    const user = this.apiService.currentUser();
    if (user && user.name && details.participants) {
      return details.participants.some(p => p.name === user.name);
    }
    return false;
  });

  isAdmin = computed(() => {
    const user = this.apiService.currentUser();
    return user ? user.role === 'admin' : false;
  });

  showParticipants = computed(() => {
    return this.isAlreadyRegistered() || this.isAdmin();
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

  onRegister() {
    const details = this.eventDetails();
    if (!details) return;

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

    if (details.price && details.price > 0) {
      this.isProcessing.set(true);
      this.processingText.set('Preparing Cashfree checkout...');

      this.apiService.createCashfreeOrder(details.id, token).subscribe({
        next: (orderRes) => {
          this.isProcessing.set(false);
          if (orderRes.success && orderRes.payment_session_id) {
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

                this.apiService.verifyCashfreePayment(details.id, { order_id: orderRes.order_id }, token).subscribe({
                  next: (verifyRes) => {
                    this.isProcessing.set(false);
                    if (verifyRes.success) {
                      this.modalState.set({
                        show: true,
                        title: 'Registration Successful!',
                        message: 'Cashfree payment verified successfully. You have secured your spot for this event!',
                        type: 'success'
                      });
                      this.loadEventDetails();
                    }
                  },
                  error: (verifyErr) => {
                    this.isProcessing.set(false);
                    const errorMsg = verifyErr.error?.message || 'Cashfree payment verification failed.';
                    alert(errorMsg);
                  }
                });
              });
            } catch (sdkErr) {
              console.warn('Cashfree SDK modal fallback, verifying order:', sdkErr);
              // Direct payment verification fallback
              this.isProcessing.set(true);
              this.processingText.set('Verifying Cashfree payment...');
              this.apiService.verifyCashfreePayment(details.id, { order_id: orderRes.order_id }, token).subscribe({
                next: (verifyRes) => {
                  this.isProcessing.set(false);
                  if (verifyRes.success) {
                    this.modalState.set({
                      show: true,
                      title: 'Registration Successful!',
                      message: 'Cashfree payment verified successfully!',
                      type: 'success'
                    });
                    this.loadEventDetails();
                  }
                },
                error: (verifyErr) => {
                  this.isProcessing.set(false);
                  alert(verifyErr.error?.message || 'Cashfree payment verification failed.');
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

      this.apiService.registerForEvent(details.id, token).subscribe({
        next: (res) => {
          this.isProcessing.set(false);
          if (res.success) {
            this.modalState.set({
              show: true,
              title: 'Registration Successful!',
              message: 'You have successfully secured your spot for this event. View and track your schedule on your dashboard.',
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
      details.price > 0 ? 'Processing Razorpay refund & releasing slot...' : 'Cancelling event registration...'
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
}
