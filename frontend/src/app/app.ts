import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlatformSettingsService } from './core/services/platform-settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private platformSettings = inject(PlatformSettingsService);

  ngOnInit() {
    // Load platform settings at startup - applies siteName to document.title, meta description, etc.
    this.platformSettings.load();
  }
}
