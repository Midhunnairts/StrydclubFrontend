import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

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
   * Create a Razorpay payment order for paid event registrations.
   */
  createRazorpayOrder(slug: string, token: string): Observable<{ success: boolean; order: any }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<{ success: boolean; order: any }>(
      `${this.apiUrl}/events/${slug}/create-order`,
      {},
      { headers }
    );
  }

  /**
   * Verify Razorpay payment and complete registration.
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
}
