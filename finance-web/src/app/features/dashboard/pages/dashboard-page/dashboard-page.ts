import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, TenantSummary } from '../../data-access/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private dashboardService = inject(DashboardService);

  // Signals para el estado
  summary = signal<TenantSummary | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed para cálculos derivados
  usersProgress = computed(() => {
    const data = this.summary();
    if (!data || !data.plan.maxUsers) return 0;
    return Math.round((data.usersCount / data.plan.maxUsers) * 100);
  });

  constructor() {
    this.loadSummary();
  }

  /**
   * Carga el resumen del tenant
   */
  private loadSummary(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getTenantSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Error cargando el resumen del dashboard';
        this.error.set(errorMsg);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Obtiene el texto descriptivo del estado de suscripción
   */
  getSubscriptionStatusText(): string {
    const status = this.summary()?.subscription.status;
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'TRIAL':
        return 'En Prueba';
      case 'EXPIRED':
        return 'Expirada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }
}
