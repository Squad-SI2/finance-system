import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PlatformTenantService } from '../../data-access/platform-tenant.service';

@Component({
  selector: 'app-tenant-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tenant-create.component.html',
  styleUrl: './tenant-create.component.css',
})
export class TenantCreateComponent {
  private fb = inject(FormBuilder);
  private tenantService = inject(PlatformTenantService);
  private router = inject(Router);

  tenantForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9-]+$'),
        Validators.maxLength(100),
      ],
    ],
  });

  isSubmitting = signal(false);
  error = signal<string | null>(null);

  /**
   * Envía el formulario para crear un nuevo tenant
   */
  onSubmit(): void {
    if (this.tenantForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    this.tenantService.createTenant(this.tenantForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/platform/tenants']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message || 'Error al crear la empresa');
      },
    });
  }

  /**
   * Auto-genera un slug a partir del nombre ingresado (opcional interactividad)
   */
  onNameChange(): void {
    const nameValue = this.tenantForm.get('name')?.value || '';
    // if slug has not been heavily edited, try to sync it:
    if (!this.tenantForm.get('slug')?.touched) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      this.tenantForm.patchValue({ slug });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.tenantForm.controls).forEach((key) => {
      const control = this.tenantForm.get(key);
      control?.markAsTouched();
    });
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.tenantForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }
}
