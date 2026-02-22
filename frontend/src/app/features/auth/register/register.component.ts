// src/app/features/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterData } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';
  passwordVisible = false;
  confirmPasswordVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Redirect si déjà connecté
    if (this.authService.isLoggedIn) {
      const role = this.authService.currentUserValue?.role;
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'boutique') {
        this.router.navigate(['/shop-owner/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
      return;
    }

    this.initForm();
  }

  initForm() {
    this.registerForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        this.passwordValidator
      ]],
      confirmPassword: ['', Validators.required],
      role: ['acheteur', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      adresse: [''],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validator personnalisé pour le mot de passe
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);

    const valid = hasNumber && hasUpper && hasLower;
    return valid ? null : { weakPassword: true };
  }

  // Validator pour vérifier que les mots de passe correspondent
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Getters pour faciliter l'accès aux champs du formulaire
  get f() {
    return this.registerForm.controls;
  }

  get passwordErrors() {
    const control = this.f['password'];
    if (control.errors && (control.dirty || control.touched || this.submitted)) {
      if (control.errors['required']) return 'Le mot de passe est requis';
      if (control.errors['minlength']) return 'Le mot de passe doit contenir au moins 6 caractères';
      if (control.errors['weakPassword']) return 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    }
    return null;
  }

  get confirmPasswordErrors() {
    const control = this.f['confirmPassword'];
    if (control.errors && (control.dirty || control.touched || this.submitted)) {
      if (control.errors['required']) return 'Veuillez confirmer votre mot de passe';
    }
    if (this.registerForm.errors?.['passwordMismatch'] && (control.dirty || control.touched || this.submitted)) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Arrêter si le formulaire est invalide
    if (this.registerForm.invalid) {
      // Marquer tous les champs comme touched pour afficher les erreurs
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const registerData: RegisterData = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Inscription réussie ! Redirection...';
        
        // La redirection est gérée automatiquement par le service
        // Mais on peut aussi ajouter un délai pour afficher le message
        setTimeout(() => {
          // Le service redirige déjà, mais au cas où
          if (!this.authService.isLoggedIn) {
            this.router.navigate(['/login']);
          }
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur inscription:', error);
        
        // Gérer les différents types d'erreurs
        if (error.error?.errors) {
          // Erreurs de validation du backend
          const errors = error.error.errors;
          this.errorMessage = errors.map((e: any) => e.msg).join(', ');
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        }
      }
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'admin': 'Administrateur',
      'boutique': 'Gérant de boutique',
      'acheteur': 'Acheteur'
    };
    return labels[role] || role;
  }
}