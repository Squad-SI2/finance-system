import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateUserRequest, UsersService } from '../../data-access/users.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css',
})
export class UserCreateComponent {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private router = inject(Router);

  /**Formulario reactivo para crear usuario
   * Campos alineados con CreateTenantUserRequest del backend:
   * email, password, firstName, lastName
   * NOTA: No hay campo 'role' — el backend no lo acepta en creación
   */
  userForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  /**Envía el formulario para crear el usuario */
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const request: CreateUserRequest = {
      email: this.userForm.value.email,
      password: this.userForm.value.password,
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
    };

    this.usersService.createUser(request).subscribe({
      next: () => {
        this.success.set(true);
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.router.navigate(['/app/users']);
        }, 2000);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Error creando usuario';
        this.error.set(errorMsg);
        this.isSubmitting.set(false);
      },
    });
  }

  /**Marca todos los campos del formulario como tocados para mostrar errores */
  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  /**Obtiene el mensaje de error para un campo específico */
  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['email']) {
        return 'Ingresa un email válido';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `Debe tener al menos ${minLength} caracteres`;
      }
    }
    return '';
  }

  /**Verifica si un campo tiene errores */
  hasFieldError(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }

  /**Navega de vuelta a la lista de usuarios */
  goBack(): void {
    this.router.navigate(['/app/users']);
  }
}