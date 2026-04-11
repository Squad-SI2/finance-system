import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlatformTenantService } from '../../data-access/platform-tenant.service';

@Component({
  selector: 'app-tenant-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tenant-edit.component.html',
})
export class TenantEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tenantService = inject(PlatformTenantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tenantId = signal<string>('');
  isSubmitting = signal(false);
  isLoading = signal(true);
  error = signal<string | null>(null);

  tenantForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: [{ value: '', disabled: true }, [Validators.required]],
    planCode: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/platform/tenants']);
      return;
    }
    
    this.tenantId.set(id);
    this.loadTenant(id);
  }

  loadTenant(id: string): void {
    this.tenantService.getTenantById(id).subscribe({
      next: (tenant) => {
        this.tenantForm.patchValue({
          name: tenant.name,
          slug: tenant.slug,
          planCode: tenant.planId || ''
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del tenant.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.tenantForm.invalid) {
      this.tenantForm.markAllAsTouched();
      return;
    }
    alert("Operación simulada! Actualización de tenant pendiente en API.");
    this.router.navigate(['/platform/tenants']);
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.tenantForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }
}
