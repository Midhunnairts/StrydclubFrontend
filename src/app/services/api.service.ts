import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  currentUser = signal<any>(null);

  constructor() {
    this.loadUserProfile();
  }

  /**
   * Load the current logged in user details from local storage token.
   */
  loadUserProfile(): Observable<{ success: boolean; user: any }> | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const token = localStorage.getItem('token');
    if (!token) {
      this.currentUser.set(null);
      return null;
    }

    if (token === 'mock-google-token') {
      const mockUser = {
        id: 'mock-google-id',
        name: 'Google Athlete',
        email: 'athlete.google@strydclub.com',
        phone: '+91 9999999999',
        role: 'user',
        favoriteSports: ['Running'],
        memberSince: 'January 2026',
        totalEvents: 1,
        eventsWon: 0,
        sportsPlayed: 1
      };
      this.currentUser.set(mockUser);
      return new Observable(subscriber => {
        subscriber.next({ success: true, user: mockUser });
        subscriber.complete();
      });
    }

    const obs = this.getUserProfile(token);
    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.currentUser.set(res.user);
        } else {
          this.currentUser.set(null);
        }
      },
      error: () => {
        this.currentUser.set(null);
      }
    });
    return obs;
  }

  /**
   * Log out the current user, clearing token and profile state.
   */
  logout() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
    this.currentUser.set(null);
  }

  /**
   * Fetch all upcoming/active events.
   */
  getEvents(): Observable<{ success: boolean; events: any[] }> {
    return this.http.get<{ success: boolean; events: any[] }>(`${this.apiUrl}/events`);
  }

  /**
   * Fetch details for a specific event by ID or slug.
   */
  getEventDetails(id: string): Observable<{ success: boolean; event: any }> {
    return this.http.get<{ success: boolean; event: any }>(`${this.apiUrl}/events/${id}`);
  }

  /**
   * Register the authenticated athlete for a specific event.
   */
  registerForEvent(id: string, token: string): Observable<{ success: boolean; message: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/events/${id}/register`,
      {},
      { headers }
    );
  }

  /**
   * Cancel event registration for the authenticated athlete.
   */
  cancelEventRegistration(id: string, token: string): Observable<{ success: boolean; message: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/events/${id}/cancel`,
      {},
      { headers }
    );
  }

  /**
   * Register the authenticated athlete for a specific event.
   */
  verifyRazorpayPayment(slug: string, payload: any, token: string): Observable<{ success: boolean; message: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/events/${slug}/verify-payment`,
      payload,
      { headers }
    );
  }

  /**
   * Create a new event (Admin only).
   */
  createEvent(eventData: any, token: string): Observable<{ success: boolean; event: any }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<{ success: boolean; event: any }>(
      `${this.apiUrl}/events`,
      eventData,
      { headers }
    );
  }

  /**
   * Send simulated verification OTP to user via email or SMS.
   */
  sendOtp(channel: 'phone' | 'email', value: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/auth/send-otp`, {
      channel,
      value
    });
  }

  /**
   * Verify the OTP and receive JWT and profile details.
   */
  verifyOtp(channel: 'phone' | 'email', value: string, code: string): Observable<{ success: boolean; token: string; user: any }> {
    return this.http.post<{ success: boolean; token: string; user: any }>(`${this.apiUrl}/auth/verify-otp`, {
      channel,
      value,
      code
    });
  }

  /**
   * Fetch authenticated user's dashboard metrics and registered events list.
   */
  getUserDashboard(token: string): Observable<{
    success: boolean;
    stats: { eventsWon: number; totalEvents: number; winRate: string; upcomingCount: number };
    registeredEvents: any[];
    pastParticipation: any[];
    profileStats: any;
  }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<{
      success: boolean;
      stats: { eventsWon: number; totalEvents: number; winRate: string; upcomingCount: number };
      registeredEvents: any[];
      pastParticipation: any[];
      profileStats: any;
    }>(`${this.apiUrl}/users/dashboard`, { headers });
  }

  /**
   * Fetch global community rankings leaderboard.
   */
  getLeaderboard(): Observable<{ success: boolean; leaderboard: any[] }> {
    return this.http.get<{ success: boolean; leaderboard: any[] }>(`${this.apiUrl}/community/leaderboard`);
  }

  /**
   * Fetch all sports categories and their dynamic stats.
   */
  getSports(): Observable<{ success: boolean; sports: any[] }> {
    return this.http.get<{ success: boolean; sports: any[] }>(`${this.apiUrl}/sports`);
  }

  /**
   * Get logged-in user profile details using their JWT token.
   */
  getUserProfile(token: string): Observable<{ success: boolean; user: any }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<{ success: boolean; user: any }>(`${this.apiUrl}/users/profile`, { headers });
  }
}
