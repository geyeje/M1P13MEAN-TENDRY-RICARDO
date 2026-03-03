import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Directive pour gérer les erreurs de chargement d'images
 * Applique un fallback une seule fois pour éviter les requêtes infinies
 */
@Directive({
  selector: 'img[appImageError]',
  standalone: true,
})
export class ImageErrorDirective {
  private hasErrored = false;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    // Appliquer le fallback une seule fois
    if (!this.hasErrored) {
      this.hasErrored = true;
      this.el.nativeElement.src = 'assets/no-image.png';
    }
  }
}
