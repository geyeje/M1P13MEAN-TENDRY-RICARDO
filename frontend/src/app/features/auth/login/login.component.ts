import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginData } from '../../../shared/models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fBuilder = inject(NonNullableFormBuilder);
  private loginService = inject(AuthService);

  //état du formulaire
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  //génération du formulaire
  loginForm = this.fBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(){
    if(this.loginForm.valid){
      this.isLoading.set(true);
      const credentials: LoginData = {
        email: this.loginForm.controls.email.value!,
        password: this.loginForm.controls.password.value!,
      };
      this.loginService.login(credentials).subscribe({
        next: (res) => {
          console.log('Connexion à Matcha réussi');
          this.isLoading.set(false);
          if (res.success) {
          }
        },
        error: (err) => {
          this.errorMessage.set('Erreur de connexion : ' + err.message);
          this.isLoading.set(false);
          if (err.error && err.error.message) {
            this.errorMessage.set(err.error.message);
          }
        },
      });
    }
  }

  showPasswordToggle() {
    this.showPassword.update((value) => !value);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

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

    return 'Champ invalide';
  }

  // Getters pour faciliter l'accès aux champs du formulaire
  get f() {
    return this.loginForm.controls;
  }
}
