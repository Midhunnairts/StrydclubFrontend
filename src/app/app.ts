import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { HeroComponent } from './components/hero/hero';
import { SportListComponent } from './components/sport-list/sport-list';
import { EventListComponent } from './components/event-list/event-list';
import { CommunityHomeComponent } from './components/community-home/community-home';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, HeroComponent, SportListComponent, EventListComponent, CommunityHomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('frontend');
}
