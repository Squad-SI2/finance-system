import { Component, inject, signal, computed, effect } from '@angular/core';
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
    if (!data) return 0;
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
   * Obtiene la clase CSS para el estado de la suscripción
   */
  getSubscriptionStatusClass(): string {
    const status = this.summary()?.subscription.status;
    const baseClass = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';

    switch (status) {
      case 'ACTIVE':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'TRIAL':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'EXPIRED':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'CANCELLED':
        return `${baseClass} bg-gray-100 text-gray-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
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

  /**
   * Obtiene la clase CSS para la barra de progreso de usuarios
   */
  getUsersProgressBarClass(): string {
    const progress = this.usersProgress();
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  }
}

