import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlatformTenantService } from '../../data-access/platform-tenant.service';
import { PlatformTenantResponse } from '../../models/platform-tenant.models';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tenant-list.component.html',
  styleUrl: './tenant-list.component.css',
})
export class TenantListComponent implements OnInit {
  private platformTenantService = inject(PlatformTenantService);

  tenants = signal<PlatformTenantResponse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Modal de confirmación
  tenantToDeactivate = signal<PlatformTenantResponse | null>(null);
  isConfirmingDeactivation = signal(false);

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.platformTenantService.getTenants().subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la lista de empresas');
        this.isLoading.set(false);
      },
    });
  }

  requestStatusToggle(tenant: PlatformTenantResponse): void {
    if (tenant.active) {
      // Pedir confirmación si se va a desactivar
      this.tenantToDeactivate.set(tenant);
      this.isConfirmingDeactivation.set(true);
    } else {
      // Activar sin confirmación
      this.executeStatusToggle(tenant);
    }
  }

  cancelDeactivation(): void {
    this.tenantToDeactivate.set(null);
    this.isConfirmingDeactivation.set(false);
  }

  confirmDeactivation(): void {
    const tenant = this.tenantToDeactivate();
    if (tenant) {
      this.executeStatusToggle(tenant);
    }
    this.cancelDeactivation();
  }

  private executeStatusToggle(tenant: PlatformTenantResponse): void {
    const action$ = tenant.active
      ? this.platformTenantService.deactivateTenant(tenant.id)
      : this.platformTenantService.activateTenant(tenant.id);

    action$.subscribe({
      next: (updatedTenant) => {
        // Update local state
        this.tenants.update(current => 
          current.map(t => t.id === updatedTenant.id ? updatedTenant : t)
        );
      },
      error: () => alert('Ocurrió un error al cambiar el estado del tenant'),
    });
  }
}
