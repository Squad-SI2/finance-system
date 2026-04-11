import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals para los datos del formulario
  email = signal('');
  password = signal('');
  tenantSlug = signal('');

  // Signals para el estado del formulario
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onTenantSlugChange(value: string): void {
    this.tenantSlug.set(value);
  }

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  onSubmit(): void {
    if (!this.email() || !this.password() || !this.tenantSlug()) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(
        {
          email: this.email(),
          password: this.password(),
        },
        this.tenantSlug()
      )
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/app']);
        },
        error: (error) => {
          this.isLoading.set(false);
          const errorMsg = error.error?.message || 'Error al iniciar sesión';
          this.errorMessage.set(errorMsg);
        },
      });
  }
}
