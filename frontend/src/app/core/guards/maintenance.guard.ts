import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformSettingsService } from '../services/platform-settings.service';
import { AuthService } from '../services/auth.service';

/**
 * Maintenance Guard: redirects non-admin users to a maintenance page if maintenanceMode is enabled.
 */
export const maintenanceGuard = () => {
  const settings = inject(PlatformSettingsService);
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAdmin = auth.currentUserValue?.role === 'admin';
  const inMaintenance = settings.maintenanceMode();

  if (inMaintenance && !isAdmin) {
    router.navigate(['/maintenance']);
    return false;
  }
  return true;
};
