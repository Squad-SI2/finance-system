import { Routes } from "@angular/router";

export const USERS_ROUTES: Routes = [
  {
<<<<<<< HEAD
    path: '',
    loadComponent: () =>
      import('./pages/users-list/users-list.component').then(
        (m) => m.UsersListComponent
      ),
=======
    path: "", //default route
    redirectTo: "list",
    pathMatch: "full",
  },
  {
    path: "list",
    loadComponent: () =>
      import("./pages/user-list-page/user-list-page").then(m => m.UserListPage),
  },
  {
    path: "create",
    loadComponent: () =>
      import("./pages/user-create-page/user-create-page").then(
        m => m.UserCreatePage
      ),
  },

  {
    path: ":id/edit",
    loadComponent: () =>
      import("./pages/user-edit-page/user-edit-page").then(m => m.UserEditPage),
>>>>>>> 4ba55fe56d249dc41da7eeef80cbd4c51223c8d4
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/user-create/user-create.component').then(
        (m) => m.UserCreateComponent
      ),
  },
];