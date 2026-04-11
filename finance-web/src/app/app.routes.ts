import { Routes } from '@angular/router';
import { AuthLayout } from './core/layout/layouts/auth-layout/auth-layout';
import { PublicLayout } from './core/layout/layouts/public-layout/public-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/public/public.routes').then(
            (m) => m.PUBLIC_ROUTES
          ),
      },
    ],
  },

  // Rutas de autenticación
  {
    path: 'login',
    component: AuthLayout,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },

  // Rutas privadas - Dashboard y gestión de tenant
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        (m) => m.DASHBOARD_ROUTES
      ),
  },

  // Ruta comodín - redirigir a home
  {
    path: '**',
    redirectTo: '',
  },
];
