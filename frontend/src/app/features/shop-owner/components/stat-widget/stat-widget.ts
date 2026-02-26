// src/app/features/shop-owner/components/stat-widget/stat-widget.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-widget.html',
  styleUrls: ['./stat-widget.scss']
})
export class StatWidget {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = '📊';
  @Input() color: 'blue' | 'green' | 'orange' | 'purple' = 'blue';
  @Input() trend?: number; // Pourcentage de changement
  @Input() subtitle?: string;

  get colorClass(): string {
    return `stat-${this.color}`;
  }

  get trendClass(): string {
    if (!this.trend) return '';
    return this.trend > 0 ? 'trend-up' : 'trend-down';
  }

  get trendIcon(): string {
    if (!this.trend) return '';
    return this.trend > 0 ? '↗' : '↘';
  }
}