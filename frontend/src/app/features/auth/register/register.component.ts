// src/app/features/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterData } from '../../../core/services/auth.service';

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
  submitted = false;
  errorMessage = '';
  successMessage = '';
  passwordVisible = false;
  confirmPasswordVisible = false;

  avatarFile: File | null = null;
  avatarPreview: string | null = null;

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
    // Trim user inputs to avoid accidental spaces
    const valsBefore = this.registerForm.value;
    this.registerForm.patchValue({
      nom: valsBefore.nom ? valsBefore.nom.trim() : valsBefore.nom,
      prenom: valsBefore.prenom ? valsBefore.prenom.trim() : valsBefore.prenom,
      email: valsBefore.email ? valsBefore.email.trim() : valsBefore.email,
      telephone: valsBefore.telephone ? valsBefore.telephone.trim() : valsBefore.telephone,
      adresse: valsBefore.adresse ? valsBefore.adresse.trim() : valsBefore.adresse,
    });

    if (this.registerForm.invalid) {
      // Marquer tous les champs comme touched pour afficher les erreurs
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    // si un avatar est sélectionné, utiliser FormData
    if (this.avatarFile) {
      const formData = new FormData();
      const vals = this.registerForm.value;
      formData.append('firstname', vals.prenom);
      formData.append('lastname', vals.nom);
      formData.append('email', vals.email);
      formData.append('password', vals.password);
      formData.append('role', vals.role);
      formData.append('phone', vals.telephone);
      formData.append('address', vals.adresse || '');
      formData.append('avatar', this.avatarFile);
      // debug: log FormData content
      for (const pair of Array.from(formData.entries())) {
        console.debug('register.formData:', pair[0], pair[1]);
      }
      // confirmPassword and acceptTerms not needed

      this.authService.register(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Inscription réussie ! Redirection...';
          setTimeout(() => {
            if (!this.authService.isLoggedIn) {
              this.router.navigate(['/login']);
            }
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur inscription:', error);
          if (error.error?.errors) {
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
    } else {
      const registerData: RegisterData = this.registerForm.value;
      // debug: log payload
      console.debug('register.payload:', registerData);

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading = false;
          this.successMessage = 'Inscription réussie ! Redirection...';
          setTimeout(() => {
            if (!this.authService.isLoggedIn) {
              this.router.navigate(['/login']);
            }
          }, 1500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur inscription:', error);
          if (error.error?.errors) {
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
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      // simple client-side size check
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Le fichier doit faire moins de 5Mo.';
        return;
      }
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(this.avatarFile);
    }
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