import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginData } from '../../../shared/models/user.model';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fBuilder = inject(NonNullableFormBuilder);
  private loginService = inject(AuthService);

  //état du formulaire
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  //génération du formulaire
  loginForm = this.fBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(){
    if(this.loginForm.valid){
      this.isLoading.set(true);
      const credencials: LoginData = {email: this.loginForm.controls.email.value!, password: this.loginForm.controls.password.value!}
      this.loginService.login(credencials).subscribe({
        next: (res) => console.log("Connexion à Matcha réussi"),
        error: (err) => console.error("erreur de connexion "+err)
      });
      this.isLoading.set(false);
    }
  }
}
