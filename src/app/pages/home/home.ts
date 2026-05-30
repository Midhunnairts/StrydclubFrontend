import { Component } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { SportListComponent } from '../../components/sport-list/sport-list';
import { EventListComponent } from '../../components/event-list/event-list';
import { CommunityHomeComponent } from '../../components/community-home/community-home';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    SportListComponent,
    EventListComponent,
    CommunityHomeComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {}
