import { Pipe, PipeTransform, inject } from '@angular/core';
import { PlatformSettingsService } from '../services/platform-settings.service';

@Pipe({
  name: 'appCurrency',
  standalone: true,
  pure: false, // Set to false to update when settings change without page refresh
})
export class AppCurrencyPipe implements PipeTransform {
  private settings = inject(PlatformSettingsService);

  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '';
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(amount)) return '';

    return this.settings.formatPrice(amount);
  }
}
