// src/app/features/admin/components/stat-card/stat-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card text-white" [ngClass]="'bg-' + color">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <div class="fs-6 fw-semibold text-white-50">{{ title }}</div>
            <div class="fs-2 fw-bold">{{ value | number }}</div>
            <div class="fs-7 text-white-50" *ngIf="subtitle">
              {{ subtitle }}
            </div>
          </div>
          <div class="fs-1" *ngIf="icon">
            <i [class]="'cil-' + icon"></i>
          </div>
        </div>
        <div class="progress mt-3" style="height: 4px;" *ngIf="percentage !== undefined">
          <div 
            class="progress-bar bg-white" 
            role="progressbar" 
            [style.width.%]="percentage"
            [attr.aria-valuenow]="percentage"
            aria-valuemin="0" 
            aria-valuemax="100">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.3s;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  `]
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() color: string = 'primary'; // primary, success, warning, danger, info
  @Input() percentage?: number;
}