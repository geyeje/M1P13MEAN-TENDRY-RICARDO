import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ShopService, Shop } from '../../../core/services/shop';

@Component({
  selector: 'app-edit-shop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-shop.html',
  styleUrl: './edit-shop.scss',
})
export class EditShop implements OnInit {
  editForm!: FormGroup;
  shop: Shop | null = null;
  loading = true;
  submitting = false;
  error = '';
  successMessage = '';

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
    'Autres',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private shopService: ShopService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadShop();
  }

  initForm() {
    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', Validators.required],
      facebook: [''],
      instagram: [''],
      twitter: [''],
      website: [''],
    });
  }

  loadShop() {
    this.loading = true;
    this.shopService.getMyShop().subscribe({
      next: (response) => {
        if (response.success && response.boutique) {
          this.shop = response.boutique;
          this.editForm.patchValue({
            name: response.boutique.name,
            description: response.boutique.description,
            category: response.boutique.category,
            phone: response.boutique.phone,
            email: response.boutique.email,
            adresse: response.boutique.adresse,
            facebook: response.boutique.socialNetwork?.facebook || '',
            instagram: response.boutique.socialNetwork?.instagram || '',
            twitter: response.boutique.socialNetwork?.twitter || '',
            website: response.boutique.socialNetwork?.website || '',
          });
          this.logoPreview = response.boutique.logo || null;
          this.bannerPreview = response.boutique.banner || null;
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement';
        this.loading = false;
      },
    });
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => (this.logoPreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onBannerChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.bannerFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => (this.bannerPreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.editForm.invalid || !this.shop) return;

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    const formData = new FormData();
    const formValue = this.editForm.value;

    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('category', formValue.category);
    formData.append('phone', formValue.phone);
    formData.append('email', formValue.email);
    formData.append('adresse', formValue.adresse);

    const socialNetwork: any = {};
    if (formValue.facebook) socialNetwork.facebook = formValue.facebook;
    if (formValue.instagram) socialNetwork.instagram = formValue.instagram;
    if (formValue.twitter) socialNetwork.twitter = formValue.twitter;
    if (formValue.website) socialNetwork.website = formValue.website;
    formData.append('socialNetwork', JSON.stringify(socialNetwork));

    if (this.logoFile) formData.append('logo', this.logoFile);
    if (this.bannerFile) formData.append('banner', this.bannerFile);

    this.shopService.updateShop(this.shop._id, formData).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Boutique mise à jour avec succès !';
        setTimeout(() => this.router.navigate(['/shop-owner/my-shop']), 1500);
      },
      error: (error) => {
        this.submitting = false;
        this.error = error.error?.message || 'Erreur lors de la mise à jour';
      },
    });
  }

  get f() {
    return this.editForm.controls;
  }
}
