import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UsersService, UserStatus } from '../../data-access/users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
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

  /**
   * Carga la lista de usuarios
   */
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

  /**
   * Cambia el estado de un usuario
   */
  toggleUserStatus(user: User): void {
    const newStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    this.usersService.updateUserStatus(user.id, { status: newStatus }).subscribe({
      next: (updatedUser) => {
        // Actualizar el usuario en la lista
        this.users.update(users =>
          users.map(u => u.id === updatedUser.id ? updatedUser : u)
        );
      },
      error: (err) => {
        this.error.set('Error actualizando estado del usuario');
        console.error('Error updating user status:', err);
      },
    });
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getStatusBadgeClass(status: UserStatus): string {
    const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

    switch (status) {
      case 'ACTIVE':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'INACTIVE':
        return `${baseClass} bg-red-100 text-red-800`;
      case 'PENDING':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Obtiene el texto descriptivo del estado
   */
  getStatusText(status: UserStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'PENDING':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Obtiene el texto descriptivo del rol
   */
  getRoleText(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'USER':
        return 'Usuario';
      default:
        return role;
    }
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}