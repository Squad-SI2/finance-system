import { Routes } from "@angular/router";

export const USERS_ROUTES: Routes = [
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
];