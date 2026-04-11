import { Component } from '@angular/core';

@Component({
  selector: 'app-platform-subscriptions-page',
  standalone: true,
  template: `
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="sm:flex sm:items-center mb-6">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-bold text-[#333333]">Suscripciones Activas</h1>
          <p class="mt-2 text-sm text-[#666666]">
            Monitorea el estado de suscripción de las empresas.
          </p>
        </div>
      </div>
      
      <div class="rounded-lg border border-dashed border-[#cccccc] p-12 text-center text-[#666666]">
        <svg class="mx-auto h-12 w-12 text-[#999999] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p>Módulo de suscripciones en construcción</p>
      </div>
    </div>
  `
})
export class PlatformSubscriptionsPage {}
