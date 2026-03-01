// src/app/features/shop-owner/create-shop/create-shop.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShopService } from '../../../core/services/shop'; 

@Component({
  selector: 'app-create-shop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-shop.html',
  styleUrls: ['./create-shop.scss']
})
export class CreateShop implements OnInit {
  createForm!: FormGroup;
  submitting = false;
  error = '';
  successMessage = '';

  // Files
  logoFile: File | null = null;
  bannerFile: File | null = null;
  logoPreview: string | null = null;
  bannerPreview: string | null = null;

  categories = [
    'Mode & Vêtements',
    'Électronique & High-tech',
    'Alimentation & Boissons',
    'Beauté & Cosmétiques',
    'Sport & Loisirs',
    'Maison & Décoration',
    'Livres & Culture',
    'Jouets & Enfants',
    'Santé & Bien-être',
    'Bijouterie & Accessoires',
    'Autres'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.checkExistingShop();
  }

  checkExistingShop() {
    this.shopService.getMyShop().subscribe({
      next: (response) => {
        if (response.success && response.boutique) {
          // Boutique existe déjà, rediriger
          this.router.navigate(['/shop-owner/my-shop']);
        }
      },
      error: () => {
        // Pas de boutique, c'est normal
      }
    });
  }

  initForm() {
    this.createForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      website: ['']
    });
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validation
      if (!file.type.match(/image\/(jpeg|jpg|png|webp|gif)/)) {
        this.error = 'Format image invalide (JPG, PNG, WEBP, GIF)';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image trop grande (max 5MB)';
        return;
      }

      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.logoPreview = e.target.result;
      reader.readAsDataURL(file);
      this.error = '';
    }
  }

  onBannerChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validation
      if (!file.type.match(/image\/(jpeg|jpg|png|webp|gif)/)) {
        this.error = 'Format image invalide (JPG, PNG, WEBP, GIF)';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Image trop grande (max 5MB)';
        return;
      }

      this.bannerFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.bannerPreview = e.target.result;
      reader.readAsDataURL(file);
      this.error = '';
    }
  }

  removeImage(type: 'logo' | 'banner') {
    if (type === 'logo') {
      this.logoFile = null;
      this.logoPreview = null;
    } else {
      this.bannerFile = null;
      this.bannerPreview = null;
    }
  }

  onSubmit() {
    if (this.createForm.invalid) {
      Object.keys(this.createForm.controls).forEach(key => {
        this.createForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const formData = new FormData();
    const formValue = this.createForm.value;

    // Données de base
    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('category', formValue.category);
    formData.append('phone', formValue.phone);
    formData.append('email', formValue.email);
    formData.append('adresse', formValue.adresse);

    // Réseaux sociaux
    const socialNetwork: any = {};
    if (formValue.facebook) socialNetwork.facebook = formValue.facebook;
    if (formValue.instagram) socialNetwork.instagram = formValue.instagram;
    if (formValue.twitter) socialNetwork.twitter = formValue.twitter;
    if (formValue.website) socialNetwork.website = formValue.website;
    formData.append('socialNetwork', JSON.stringify(socialNetwork));

    // Fichiers
    if (this.logoFile) formData.append('logo', this.logoFile);
    if (this.bannerFile) formData.append('banner', this.bannerFile);

    this.shopService.createShop(formData).subscribe({
      next: (response) => {
        this.submitting = false;
        this.successMessage = 'Boutique créée avec succès ! Redirection...';
        setTimeout(() => {
          this.router.navigate(['/shop-owner/my-shop']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erreur création:', error);
        this.submitting = false;
        if (error.error?.errors) {
          this.error = error.error.errors.map((e: any) => e.msg).join(', ');
        } else {
          this.error = error.error?.message || 'Erreur lors de la création de la boutique';
        }
      }
    });
  }

  get f() { return this.createForm.controls; }
}