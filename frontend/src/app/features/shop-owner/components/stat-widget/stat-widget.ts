// src/app/features/shop-owner/components/stat-widget/stat-widget.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-widget.html',
  styleUrls: ['./stat-widget.scss'],
})
export class StatWidget {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = 'chart-pie';
  @Input() color:
    | 'primary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'blue'
    | 'green'
    | 'orange'
    | 'purple' = 'primary';
  @Input() trend?: number;
  @Input() subtitle?: string;

  get colorClass(): string {
    return `bg-${this.color}`;
  }

  get iconClass(): string {
    return `cil-${this.icon}`;
  }
}
