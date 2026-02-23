// frontend/src/app/features/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  roles = [
    { value: 'acheteur', label: 'Acheteur' },
    { value: 'boutique', label: 'Gérant de Boutique' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si déjà connecté
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }

    // Initialiser le formulaire
    this.registerForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['acheteur', [Validators.required]],
      telephone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      adresse: [''],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Getters pour faciliter l'accès aux champs du formulaire
  get f() {
    return this.registerForm.controls;
  }

  // Basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Soumettre le formulaire
  onSubmit(): void {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.successMessage = '';

    // Vérifier la validité du formulaire
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    // Préparer les données (sans confirmPassword et acceptTerms)
    const { confirmPassword, acceptTerms, ...registerData } = this.registerForm.value;

    // Appel au service d'inscription
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = 'Inscription réussie ! Redirection...';
          
          // Rediriger selon le rôle
          setTimeout(() => {
            const role = response.user?.role;
            switch(role) {
              case 'admin':
                this.router.navigate(['/admin']);
                break;
              case 'boutique':
                this.router.navigate(['/boutique/dashboard']);
                break;
              case 'acheteur':
              default:
                this.router.navigate(['/']);
                break;
            }
          }, 1500);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur inscription:', error);
        
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        }
      }
    });
  }

  // Obtenir le message d'erreur pour un champ spécifique
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    
    if (!field || !field.touched || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'Ce champ est requis';
    }
    if (field.errors['email']) {
      return 'Email invalide';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum ${minLength} caractères requis`;
    }
    if (field.errors['pattern']) {
      if (fieldName === 'telephone') {
        return 'Numéro de téléphone invalide (10 chiffres)';
      }
    }

    return 'Champ invalide';
  }
}