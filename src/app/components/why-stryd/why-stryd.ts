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
  citiesCount = signal<string>('24');

  ngOnInit() {
    this.apiService.getPublicStats().subscribe({
      next: (res) => {
        if (res && res.success && res.stats && res.stats.citiesText) {
          this.citiesCount.set(res.stats.citiesText);
        }
      }
    });
  }
}
