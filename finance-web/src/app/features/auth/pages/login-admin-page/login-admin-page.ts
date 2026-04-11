import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { PlatformAuthService } from "../../data-access/platform-auth.service";

@Component({
  selector: "app-login-admin-page",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./login-admin-page.html",
  styleUrl: "./login-admin-page.css",
})
export class LoginAdminPage {
  private readonly router = inject(Router);
  private readonly platformAuthService = inject(PlatformAuthService);

  email = signal("");
  password = signal("");
  
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onEmailChange(value: string): void {
    this.email.set(value);
  }

  onPasswordChange(value: string): void {
    this.password.set(value);
  }

  onSubmit(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set("Por favor ingresa correo y contraseña.");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.platformAuthService
      .login({ email: this.email(), password: this.password() })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigateByUrl("/platform/tenants");
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || "Error al iniciar sesión como Super Admin");
        },
      });
  }
}
