import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { EventsComponent } from './pages/events/events';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'events', component: EventsComponent }
];
