import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { PlatformSettingsService } from './core/services/platform-settings.service';
import { SeoService } from './core/services/seo.service';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private platformSettings = inject(PlatformSettingsService);
  private seoService = inject(SeoService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    // Load platform settings at startup
    this.platformSettings.load();

    // Listen to route changes to update SEO
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      this.seoService.updateSeo({
        title: data['title'],
        description: data['description'],
        keywords: data['keywords']
      });
    });
  }
}
