// src/app/features/admin/components/chart-widget/chart-widget.component.ts
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ThemeService } from '../../../../core/services/theme.service';
import { effect, inject } from '@angular/core';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="card">
      <div class="card-header">
        <strong>{{ title }}</strong>
      </div>
      <div class="card-body">
        <canvas baseChart [type]="chartType" [data]="chartData" [options]="chartOptions"> </canvas>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class ChartWidgetComponent implements OnInit {
  private themeService = inject(ThemeService);
  @Input() title: string = 'Chart';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() chartType: 'line' | 'bar' | 'doughnut' = 'line';
  @Input() backgroundColor?: string | string[];
  @Input() borderColor?: string | string[];

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData!: ChartConfiguration['data'];
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  constructor() {
    effect(() => {
      const isDark = this.themeService.theme === 'dark';
      this.updateChartTheme(isDark);
    });
  }

  ngOnInit() {
    this.chartData = {
      labels: this.labels,
      datasets: [
        {
          label: this.title,
          data: this.data,
          backgroundColor: this.backgroundColor || 'rgba(54, 162, 235, 0.2)',
          borderColor: this.borderColor || 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          fill: true,
        },
      ],
    };

    // Pas de scales pour doughnut
    if (this.chartType === 'doughnut') {
      this.chartOptions = {
        ...this.chartOptions,
        scales: undefined,
      };
    }
  }

  private updateChartTheme(isDark: boolean) {
    const textColor = isDark ? '#e4e6eb' : '#3c4b64';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 10, 0.1)';

    this.chartOptions = {
      ...this.chartOptions,
      plugins: {
        ...this.chartOptions?.plugins,
        legend: {
          ...this.chartOptions?.plugins?.legend,
          labels: {
            color: textColor,
          },
        },
      },
      scales:
        this.chartType !== 'doughnut'
          ? {
              x: {
                grid: { color: gridColor },
                ticks: { color: textColor },
              },
              y: {
                grid: { color: gridColor },
                ticks: { color: textColor },
              },
            }
          : undefined,
    };

    if (this.chart) {
      this.chart.update();
    }
  }
}
