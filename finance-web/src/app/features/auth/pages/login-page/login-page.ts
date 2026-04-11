import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../data-access/auth.service';

@Component({
  selector: 'app-login-page',
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

  /**
   * Maneja el cambio del tenant slug
   */
  onTenantSlugChange(value: string): void {
    this.tenantSlug.set(value);
  }

  /**
   * Maneja el cambio del email
   */
  onEmailChange(value: string): void {
    this.email.set(value);
  }

  /**
   * Maneja el cambio de la contraseña
   */
  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  /**
   * Maneja el envío del formulario de login
   */
  onSubmit(): void {
    // Validación básica
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
          // Redirigir al dashboard después del login exitoso
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          const errorMsg = error.error?.message || 'Error al iniciar sesión';
          this.errorMessage.set(errorMsg);
        },
      });
  }
}
