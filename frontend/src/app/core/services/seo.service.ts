import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PlatformSettingsService } from './platform-settings.service';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private platformSettings = inject(PlatformSettingsService);

  /**
   * Met à jour le titre et les balises meta de la page
   * @param config Configuration SEO pour la page
   */
  updateSeo(config: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: string;
  }) {
    const siteName = this.platformSettings.siteName() || 'Matcha Center';
    const pageTitle = config.title
      ? `${config.title} | ${siteName}`
      : `${siteName} | Votre marketplace locale`;
    const description =
      config.description ||
      this.platformSettings.siteDescription() ||
      'Découvrez Matcha Center, la plateforme leader pour les produits locaux et artisanaux.';

    // Titre
    this.title.setTitle(pageTitle);

    // Meta standards
    this.meta.updateTag({ name: 'description', content: description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
    }

    // Twitter
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    if (config.image) {
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }
  }

  /**
   * Réinitialise le SEO aux valeurs par défaut
   */
  resetSeo() {
    this.updateSeo({});
  }
}
