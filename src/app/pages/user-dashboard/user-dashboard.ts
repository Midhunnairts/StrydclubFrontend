import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})
export class UserDashboardComponent {
  rules = signal<RuleItem[]>([
    { text: 'Participants must arrive 30 minutes before start time' },
    { text: 'Valid ID required for registration verification' },
    { text: 'Running shoes mandatory - no casual footwear' },
    { text: 'Hydration stations available every kilometer' },
    { text: 'Medical support on standby throughout the route' }
  ]);

  schedule = signal<ScheduleItem[]>([
    { time: '5:30 AM', activity: 'Registration & Check-in' },
    { time: '5:50 AM', activity: 'Warm-up Session' },
    { time: '6:00 AM', activity: 'Race Begins' },
    { time: '7:30 AM', activity: 'Awards Ceremony' },
    { time: '8:00 AM', activity: 'Post-Race Refreshments' }
  ]);

  participants = signal<ParticipantItem[]>([
    { name: 'Rahul Sharma', role: 'Participant' },
    { name: 'Priya Desai', role: 'Participant' },
    { name: 'Amit Kumar', role: 'Participant' },
    { name: 'Sneha Reddy', role: 'Participant' }
  ]);

  slotsFilled = 45;
  slotsTotal = 100;
  price = 499;

  onRegister() {
    console.log('Registering for Weekend 5K Marathon...');
  }

  onShare() {
    console.log('Sharing event Weekend 5K Marathon...');
  }
}
