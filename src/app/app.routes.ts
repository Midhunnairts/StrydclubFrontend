import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { EventsComponent } from './pages/events/events';
import { SportsComponent } from './pages/sports/sports';
import { CommunityComponent } from './pages/community/community';
import { AboutComponent } from './pages/about/about';
import { ContactComponent } from './pages/contact/contact';
import { LoginComponent } from './pages/login/login';
import { IndividualEventComponent } from './pages/individual-event/individual-event';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard';
import { HostEventComponent } from './pages/host-event/host-event';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'host-event', component: HostEventComponent, canActivate: [authGuard] },
  { path: 'events/:id', component: IndividualEventComponent },
  { path: 'events', component: EventsComponent },
  { path: 'sports', component: SportsComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent }
];

