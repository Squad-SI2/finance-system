import { Routes } from '@angular/router';

export const PLATFORM_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'tenants',
    pathMatch: 'full',
  },
  {
    path: 'tenants',
    loadComponent: () =>
      import('./pages/tenant-list/tenant-list.component').then(
        (m) => m.TenantListComponent
      ),
  },
  {
    path: 'tenants/new',
    loadComponent: () =>
      import('./pages/tenant-create/tenant-create.component').then(
        (m) => m.TenantCreateComponent
      ),
  },
  {
    path: 'tenants/:id/edit',
    loadComponent: () =>
      import('./pages/tenant-edit/tenant-edit.component').then(
        (m) => m.TenantEditComponent
      ),
  },
  {
    path: 'plans',
    loadComponent: () =>
      import('./pages/platform-plans/platform-plans.page').then(
        (m) => m.PlatformPlansPage
      ),
  },
  {
    path: 'subscriptions',
    loadComponent: () =>
      import('./pages/platform-subscriptions/platform-subscriptions.page').then(
        (m) => m.PlatformSubscriptionsPage
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/platform-profile/platform-profile.page').then(
        (m) => m.PlatformProfilePage
      ),
  },
];
