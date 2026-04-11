import { Routes } from '@angular/router';
import { AppLayout } from '../../core/layout/layouts/app-layout/app-layout';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/users-list/users-list.component').then(
            (m) => m.UsersListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./pages/user-create/user-create.component').then(
            (m) => m.UserCreateComponent
          ),
      },
    ],
  },
];