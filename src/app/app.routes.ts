import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { EventsComponent } from './pages/events/events';
import { SportsComponent } from './pages/sports/sports';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'events', component: EventsComponent },
  { path: 'sports', component: SportsComponent }
];
