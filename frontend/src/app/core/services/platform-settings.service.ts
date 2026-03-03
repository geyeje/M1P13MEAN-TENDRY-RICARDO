import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PlatformSettings {
  siteName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  commissionRate: number;
  allowRegistrations: boolean;
  multiVendor: boolean;
  defaultCurrency: string;
  siteDescription: string;
}

const DEFAULTS: PlatformSettings = {
  siteName: 'MATCHA Center',
  contactEmail: 'contact@matcha-center.com',
  maintenanceMode: false,
  commissionRate: 10,
  allowRegistrations: true,
  multiVendor: true,
  defaultCurrency: 'EUR',
  siteDescription: 'Votre marketplace multi-vendeurs.',
};

@Injectable({ providedIn: 'root' })
export class PlatformSettingsService {
  private _settings = signal<PlatformSettings>(DEFAULTS);

  // Public read-only signals
  readonly settings = computed(() => this._settings());
  readonly siteName = computed(() => this._settings().siteName);
  readonly maintenanceMode = computed(() => this._settings().maintenanceMode);
  readonly allowRegistrations = computed(() => this._settings().allowRegistrations);
  readonly defaultCurrency = computed(() => this._settings().defaultCurrency);
  readonly siteDescription = computed(() => this._settings().siteDescription);
  readonly commissionRate = computed(() => this._settings().commissionRate);

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return this.http
      .get<{ success: boolean; settings: PlatformSettings }>(`${environment.apiUrl}/settings`)
      .toPromise()
      .then((res) => {
        if (res?.success && res.settings) {
          this._settings.set({ ...DEFAULTS, ...res.settings });
          this.applyToDocument();
        }
      })
      .catch(() => {
        // Silently use defaults if settings can't be loaded (e.g. not logged in)
      });
  }

  /**
   * Update settings locally after saving to backend.
   */
  update(settings: Partial<PlatformSettings>) {
    this._settings.set({ ...this._settings(), ...settings });
    this.applyToDocument();
  }

  /**
   * Format a price using the platform's default currency.
   */
  formatPrice(amount: number): string {
    const currency = this._settings().defaultCurrency;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  private applyToDocument() {
    const settings = this._settings();
    // Update document title
    document.title = settings.siteName;
    // Update meta description
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.content = settings.siteDescription;
  }
}
