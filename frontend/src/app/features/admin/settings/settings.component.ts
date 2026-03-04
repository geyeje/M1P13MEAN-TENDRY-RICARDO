import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../core/services/admin.service';
import { PlatformSettingsService } from '../../../core/services/platform-settings.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="admin-settings-container py-4">
      <div class="container-fluid">
        <!-- Header -->
        <div class="settings-header mb-4">
          <div class="d-flex justify-content-between align-items-end">
            <div>
              <h1
                class="h3 mb-1 d-flex align-items-center gap-2"
                style="color: var(--cui-body-color)"
              >
                <mat-icon color="primary">settings</mat-icon>
                Paramètres de la Plateforme
              </h1>
              <p class="text-muted mb-0">
                Gérez la configuration globale, les APIs et les préférences du système.
              </p>
            </div>
            <div
              *ngIf="loading"
              class="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Left Column: Navigation Tabs -->
          <div class="col-lg-3">
            <div class="card shadow-sm border-0 sticky-top" style="top: 80px;">
              <div class="list-group list-group-flush rounded-3">
                <a
                  (click)="activeSection = 'general'"
                  class="list-group-item list-group-item-action border-0 py-3 d-flex align-items-center gap-3 cursor-pointer"
                  [class.active]="activeSection === 'general'"
                >
                  <mat-icon>admin_panel_settings</mat-icon> Configuration Générale
                </a>
                <!-- Hidden sections (non-functional) -->
              </div>
            </div>
          </div>

          <!-- Right Column: Form Content -->
          <div class="col-lg-9">
            <!-- General Settings -->
            @if (activeSection === 'general') {
              <div class="card shadow-sm border-0 mb-4">
                <div class="card-header py-3 border-0">
                  <h5 class="card-title mb-0 fw-bold">Configuration Générale</h5>
                </div>
                <div class="card-body">
                  <form (submit)="saveSettings($event)">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Nom de la Plateforme</label>
                        <input
                          type="text"
                          class="form-control form-control-lg"
                          [(ngModel)]="config.siteName"
                          name="siteName"
                          [disabled]="loading"
                        />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Email de contact (Support)</label>
                        <input
                          type="email"
                          class="form-control form-control-lg"
                          [(ngModel)]="config.contactEmail"
                          name="contactEmail"
                          [disabled]="loading"
                        />
                      </div>
                      <div class="col-12">
                        <label class="form-label fw-semibold">Description courte (SEO)</label>
                        <textarea
                          class="form-control"
                          rows="2"
                          [(ngModel)]="config.siteDescription"
                          name="siteDescription"
                          placeholder="Description de la plateforme..."
                          [disabled]="loading"
                        ></textarea>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label fw-semibold">Devise par défaut</label>
                        <select
                          class="form-select"
                          [(ngModel)]="config.defaultCurrency"
                          name="defaultCurrency"
                          [disabled]="loading"
                        >
                          <option value="EUR">Euros (€)</option>
                          <option value="USD">Dollars ($)</option>
                          <option value="MGA">Ariary (Ar)</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <div class="form-check form-switch mt-4 pt-2">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="maintenance"
                            [(ngModel)]="config.maintenanceMode"
                            name="maintenance"
                            [disabled]="loading"
                          />
                          <label class="form-check-label fw-semibold" for="maintenance"
                            >Mode Maintenance</label
                          >
                        </div>
                        <small class="text-muted d-block mt-1"
                          >Si activé, seuls les administrateurs peuvent accéder au site.</small
                        >
                      </div>
                    </div>

                    <div class="mt-4 pt-4 border-top">
                      <h5 class="card-title mb-3 fw-bold">Fonctionnalités & Limites</h5>
                      <div class="list-group list-group-flush">
                        <div
                          class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center pb-3"
                        >
                          <div>
                            <h6 class="mb-0 fw-bold">Inscriptions ouvertes</h6>
                            <small class="text-muted"
                              >Autoriser les nouveaux utilisateurs à créer un compte.</small
                            >
                          </div>
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              [(ngModel)]="config.allowRegistrations"
                              name="allowRegistrations"
                              [disabled]="loading"
                            />
                          </div>
                        </div>
                        <div
                          class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center py-3"
                        >
                          <div>
                            <h6 class="mb-0 fw-bold">Multi-vendeurs</h6>
                            <small class="text-muted"
                              >Permettre aux boutiques de gérer leurs propres catalogues.</small
                            >
                          </div>
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              [(ngModel)]="config.multiVendor"
                              name="multiVendor"
                              [disabled]="loading"
                            />
                          </div>
                        </div>
                        <div
                          class="list-group-item border-0 px-0 d-flex justify-content-between align-items-center py-3"
                        >
                          <div>
                            <h6 class="mb-0 fw-bold">Commission Plateforme (%)</h6>
                            <small class="text-muted"
                              >Pourcentage prélevé sur chaque vente effectuée.</small
                            >
                          </div>
                          <div style="width: 100px;">
                            <div class="input-group input-group-sm">
                              <input
                                type="number"
                                class="form-control text-center"
                                [(ngModel)]="config.commissionRate"
                                name="commissionRate"
                                [disabled]="loading"
                              />
                              <span class="input-group-text">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-top">
                      <button
                        type="submit"
                        class="btn btn-primary btn-lg d-inline-flex align-items-center gap-2"
                        [disabled]="loading"
                      >
                        <mat-icon>{{ loading ? 'sync' : 'save' }}</mat-icon>
                        {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Danger Zone -->
              <div class="card shadow-sm border-danger-subtle border-0 mb-4">
                <div class="card-body danger-zone-body rounded">
                  <div class="d-flex align-items-center justify-content-between">
                    <div>
                      <h6 class="text-danger mb-0 fw-bold">Nettoyage du Cache</h6>
                      <small class="text-danger"
                        >Supprime les fichiers temporaires et rafraîchit les sessions.</small
                      >
                    </div>
                    <button class="btn btn-outline-danger btn-sm" (click)="clearCache()">
                      Vider le cache
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-settings-container {
        background-color: var(--cui-body-bg);
        min-height: calc(100vh - 64px);
      }
      .cursor-pointer {
        cursor: pointer;
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .card {
        background-color: var(--cui-card-bg);
        color: var(--cui-body-color);
      }
      .card-header {
        background-color: var(--cui-card-cap-bg);
      }
      .form-control,
      .form-select {
        background-color: var(--cui-input-bg);
        color: var(--cui-input-color);
        border-color: var(--cui-input-border-color);
      }
      .form-control:focus,
      .form-select:focus {
        border-color: #84cc16;
        box-shadow: 0 0 0 0.25rem rgba(132, 204, 22, 0.15);
        background-color: var(--cui-input-bg);
        color: var(--cui-input-color);
      }
      .list-group-item {
        background-color: transparent;
        color: var(--cui-body-color);
        border-color: var(--cui-border-color);
      }
      .list-group-item.active {
        background-color: rgba(132, 204, 22, 0.1);
        color: #84cc16 !important;
        border-left: 4px solid #84cc16 !important;
        font-weight: 600;
      }
      :host-context([data-coreui-theme='dark']) .list-group-item.active {
        background-color: rgba(132, 204, 22, 0.2);
        color: #bef264 !important;
      }
      .list-group-item.active mat-icon {
        color: #84cc16;
      }
      .form-check-input:checked {
        background-color: #84cc16;
        border-color: #84cc16;
      }
      .danger-zone-body {
        background-color: rgba(220, 38, 38, 0.05);
      }
      :host-context([data-coreui-theme='dark']) .danger-zone-body {
        background-color: rgba(220, 38, 38, 0.1);
      }
      .spinner-border {
        width: 1.5rem;
        height: 1.5rem;
      }
      .input-group-text {
        background-color: var(--cui-input-group-addon-bg);
        color: var(--cui-input-group-addon-color);
        border-color: var(--cui-input-border-color);
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  config: any = {
    siteName: 'MATCHA Center',
    contactEmail: 'admin@matcha-center.com',
    maintenanceMode: false,
    commissionRate: 10,
    allowRegistrations: true,
    multiVendor: true,
    defaultCurrency: 'EUR',
    siteDescription: '',
  };
  loading = false;
  activeSection = 'general';

  constructor(
    private adminService: AdminService,
    private platformSettings: PlatformSettingsService,
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    this.adminService.getSettings().subscribe({
      next: (res) => {
        if (res.success && res.settings) {
          this.config = { ...this.config, ...res.settings };
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement des paramètres');
      },
    });
  }

  saveSettings(event: Event) {
    event.preventDefault();
    this.loading = true;
    this.adminService.updateSettings(this.config).subscribe({
      next: (res) => {
        if (res.success) {
          // Sync global service so changes (siteName, maintenanceMode...) apply immediately everywhere
          this.platformSettings.update(this.config);
          alert('Paramètres enregistrés avec succès !\nLes changements sont actifs immédiatement.');
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert("Erreur lors de l'enregistrement des paramètres");
      },
    });
  }

  clearCache() {
    if (confirm('Voulez-vous vraiment vider le cache du système ?')) {
      alert('Cache vidé avec succès (Simulation backend)');
    }
  }
}
