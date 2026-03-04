import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlatformSettingsService } from '../../../core/services/platform-settings.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:white; text-align:center; padding: 2rem;"
    >
      <div
        style="background: rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius: 1.5rem; padding: 3rem; max-width: 500px;"
      >
        <div style="font-size: 4rem; margin-bottom: 1rem;">🔧</div>
        <h1 style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">
          {{ settings.siteName() }}
        </h1>
        <p style="font-size: 1.1rem; color: rgba(255,255,255,0.7); margin-bottom: 2rem;">
          Le site est actuellement en maintenance. Nous revenons bientôt !
        </p>
        <p style="font-size: 0.9rem; color: rgba(255,255,255,0.4);">
          Contact : {{ settings.settings().contactEmail }}
        </p>
        <a
          routerLink="/login"
          style="display:inline-block; margin-top:1.5rem; padding: 0.75rem 2rem; background:#84cc16; color:#1e293b; font-weight:700; border-radius:0.75rem; text-decoration:none;"
        >
          Accès Admin
        </a>
      </div>
    </div>
  `,
})
export class MaintenanceComponent {
  settings = inject(PlatformSettingsService);
}
