import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-why-stryd',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './why-stryd.html',
  styleUrl: './why-stryd.scss'
})
export class WhyStrydComponent implements OnInit {
  private apiService = inject(ApiService);
  citiesCount = signal<string>('1');

  ngOnInit() {
    this.apiService.getPublicStats().subscribe({
      next: (res) => {
        if (res && res.success && res.stats) {
          if (Array.isArray(res.stats.cityList) && res.stats.cityList.length > 0) {
            const hostedCities = res.stats.cityList.filter(c => (c.eventsCount || 0) > 0);
            this.citiesCount.set(hostedCities.length > 0 ? `${hostedCities.length}` : (res.stats.citiesText || '1'));
          } else if (res.stats.citiesText) {
            this.citiesCount.set(res.stats.citiesText);
          }
        }
      }
    });
  }
}
