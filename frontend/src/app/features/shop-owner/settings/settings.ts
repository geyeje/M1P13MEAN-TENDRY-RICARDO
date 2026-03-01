import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/shop';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-shop-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit {
  shop: Shop | null = null;
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';

  contactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private shopService: ShopService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadShop();
  }

  initForm() {
    this.contactForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^[+0-9][0-9 ]{6,14}$/)]],
      email: ['', [Validators.required, Validators.email]],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      website: [''],
    });
  }

  loadShop() {
    this.loading = true;
    this.shopService.getMyShop().subscribe({
      next: (res) => {
        if (res.success && res.boutique) {
          this.shop = res.boutique;
          this.contactForm.patchValue({
            phone: res.boutique.phone || '',
            email: res.boutique.email || '',
            facebook: res.boutique.socialNetwork?.facebook || '',
            instagram: res.boutique.socialNetwork?.instagram || '',
            twitter: res.boutique.socialNetwork?.twitter || '',
            website: res.boutique.socialNetwork?.website || '',
          });
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  saveContact() {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid || !this.shop) return;

    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    const values = this.contactForm.value;

    formData.append('phone', values.phone);
    formData.append('email', values.email);

    const socialNetwork: any = {};
    if (values.facebook) socialNetwork.facebook = values.facebook;
    if (values.instagram) socialNetwork.instagram = values.instagram;
    if (values.twitter) socialNetwork.twitter = values.twitter;
    if (values.website) socialNetwork.website = values.website;
    formData.append('socialNetwork', JSON.stringify(socialNetwork));

    this.shopService.updateShop(this.shop._id, formData).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Paramètres mis à jour avec succès !';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
      },
    });
  }

  deleteShop() {
    if (!this.shop) return;
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer votre boutique ? Cette action est irréversible et supprimera tous vos produits.',
      )
    ) {
      return;
    }

    this.shopService.deleteShop(this.shop._id).subscribe({
      next: () => {
        this.router.navigate(['/shop-owner/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression de la boutique';
      },
    });
  }

  get f() {
    return this.contactForm.controls;
  }
}
