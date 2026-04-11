import { Component } from '@angular/core';

@Component({
  selector: 'app-platform-plans-page',
  standalone: true,
  template: `
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center mb-6">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-bold text-[#333333]">Gestión de Planes</h1>
          <p class="mt-2 text-sm text-[#666666]">
            Configura los planes de suscripción y sus precios.
          </p>
        </div>
      </div>
      
      <div class="rounded-lg border border-dashed border-[#cccccc] p-12 text-center text-[#666666]">
        <svg class="mx-auto h-12 w-12 text-[#999999] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p>Módulo de planes en construcción</p>
      </div>
    </div>
  `
})
export class PlatformPlansPage {}
