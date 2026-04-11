import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User, UsersService } from '../../data-access/users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  private usersService = inject(UsersService);

  // Signals para estado
  readonly users = signal<User[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  /**Carga la lista de usuarios*/
  private loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Error cargando usuarios';
        this.error.set(errorMsg);
        this.isLoading.set(false);
      },
    });
  }

  /**Activa o desactiva un usuario
   * Usa los endpoints reales: PATCH /api/users/{id}/activate | deactivate*/
  toggleUserActive(user: User): void {
    const action$ = user.active
      ? this.usersService.deactivateUser(user.id)
      : this.usersService.activateUser(user.id);

    action$.subscribe({
      next: (updatedUser) => {
        this.users.update(users =>
          users.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
      },
      error: (err) => {
        this.error.set('Error actualizando estado del usuario');
        console.error('Error updating user:', err);
      },
    });
  }

  /**Obtiene la clase CSS para el badge de estado*/
  getStatusBadgeClass(active: boolean): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    return active
      ? `${baseClass} bg-[#cccccc] text-[#333333]`
      : `${baseClass} bg-[#f5f5f5] text-[#666666]`;
  }

  /**Obtiene el texto descriptivo del estado*/
  getStatusText(active: boolean): string {
    return active ? 'Activo' : 'Inactivo';
  }

  /**Formatea la fecha para mostrar*/
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}