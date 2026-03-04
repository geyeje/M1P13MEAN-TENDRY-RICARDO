// src/app/features/admin/dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { PlatformSettingsService } from '../../../core/services/platform-settings.service';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { AdminService, DashboardStats } from '../../../core/services/admin.service';
import { StatCardComponent } from '../components/stat-card/stat-card.components';
import { ChartWidgetComponent } from '../components/chart-widget/chart-widget.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, ChartWidgetComponent, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  stats?: DashboardStats;
  loading = true;
  error = false;

  // Chart data
  ordersChartLabels: string[] = [];
  ordersChartData: number[] = [];
  revenueChartData: number[] = [];

  usersChartLabels: string[] = [];
  usersChartData: number[] = [];

  categoryChartLabels: string[] = [];
  categoryChartData: number[] = [];

  orderStatusLabels: string[] = [];
  orderStatusData: number[] = [];
  private platformSettings = inject(PlatformSettingsService);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.error = false;

    this.adminService.getDashboard().subscribe({
      next: (response) => {
        this.stats = response.dashboard;
        this.prepareChartData();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement dashboard:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  prepareChartData() {
    if (!this.stats) return;

    // Orders by day (30 days)
    this.ordersChartLabels = this.stats.charts.ordersByDay.map((d) => {
      const date = new Date(d._id);
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    });
    this.ordersChartData = this.stats.charts.ordersByDay.map((d) => d.count);
    this.revenueChartData = this.stats.charts.ordersByDay.map((d) => d.revenue);

    // Users by day
    this.usersChartLabels = this.stats.charts.usersByDay.map((d) => {
      const date = new Date(d._id);
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    });
    this.usersChartData = this.stats.charts.usersByDay.map((d) => d.count);

    // Products by category
    this.categoryChartLabels = this.stats.products.byCategory.map((c) => c._id);
    this.categoryChartData = this.stats.products.byCategory.map((c) => c.count);

    // Orders by status
    const statusMap: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmées',
      processing: 'En préparation',
      shipped: 'Expédiées',
      delivered: 'Livrées',
      cancelled: 'Annulées',
    };
    this.orderStatusLabels = this.stats.orders.byStatus.map((s) => statusMap[s._id] || s._id);
    this.orderStatusData = this.stats.orders.byStatus.map((s) => s.count);
  }

  getRoleLabel(role: string): string {
    const roleMap: Record<string, string> = {
      admin: 'Administrateurs',
      boutique: 'Gérants',
      acheteur: 'Acheteurs',
    };
    return roleMap[role] || role;
  }

  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      en_attente: 'En attente',
      active: 'Actives',
      suspendue: 'Suspendues',
    };
    return statusMap[status] || status;
  }

  formatCurrency(value: number): string {
    return this.platformSettings.formatPrice(value);
  }
}
