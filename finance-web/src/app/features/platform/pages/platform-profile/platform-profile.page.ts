import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAuthService } from '../../../auth/data-access/platform-auth.service';

@Component({
  selector: 'app-platform-profile-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-[#333333] mb-6">Perfil de Super Administrador</h1>
      
      <div class="bg-[#ffffff] shadow-sm ring-1 ring-[#cccccc] sm:rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-[#cccccc] flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium leading-6 text-[#333333]">Información de la Sesión</h3>
            <p class="mt-1 max-w-2xl text-sm text-[#666666]">
              Detalles del administrador conectado actualmente.
            </p>
          </div>
          <div class="h-12 w-12 rounded-full bg-[#f5f5f5] border border-[#cccccc] flex items-center justify-center text-[#333333] font-bold">
            {{ user()?.name?.charAt(0) || 'S' }}
          </div>
        </div>
        <div class="px-4 py-5 sm:p-0">
          <dl class="divide-y divide-[#cccccc]">
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-[#666666]">Nombre</dt>
              <dd class="mt-1 text-sm text-[#333333] sm:mt-0 sm:col-span-2">{{ user()?.name || 'Administrador Global' }}</dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-[#666666]">Correo Electrónico</dt>
              <dd class="mt-1 text-sm text-[#333333] sm:mt-0 sm:col-span-2">{{ user()?.email }}</dd>
            </div>
            <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-[#666666]">Permisos</dt>
              <dd class="mt-1 text-sm text-[#333333] sm:mt-0 sm:col-span-2">
                <span class="inline-flex rounded-full bg-[#333333] px-2.5 py-0.5 text-xs font-medium text-[#ffffff]">
                  Acceso Total (Superadmin)
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div class="mt-8 flex justify-end">
        <button (click)="logout()" class="px-4 py-2 border border-[#999999] text-[#333333] rounded-md hover:bg-[#f5f5f5] transition">
          Cerrar Sesión
        </button>
      </div>
    </div>
  `
})
export class PlatformProfilePage {
  private readonly platformAuthService = inject(PlatformAuthService);
  
  user = this.platformAuthService.user$;

  logout(): void {
    this.platformAuthService.logout();
  }
}
