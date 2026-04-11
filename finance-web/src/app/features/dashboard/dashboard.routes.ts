import { Routes } from '@angular/router';
import { AppLayout } from '../../core/layout/layouts/app-layout/app-layout';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard-page/dashboard-page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('../users/users.routes').then((m) => m.USERS_ROUTES),
      },
    ],
  },
];
