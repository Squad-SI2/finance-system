import { Routes } from "@angular/router";
import { AuthLayout } from "./core/layout/layouts/auth-layout/auth-layout";
import { PublicLayout } from "./core/layout/layouts/public-layout/public-layout";
import { AdminAuthLayout } from "./core/layout/layouts/admin-auth-layout/admin-auth-layout";
import { AppLayout } from "./core/layout/layouts/app-layout/app-layout";
import { PlatformLayout } from "./core/layout/layouts/platform-layout/platform-layout";
import { platformGuard } from "./core/guards/platform.guard";

export const routes: Routes = [
  // Rutas públicas
  {
    path: "",
    component: PublicLayout,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/public/public.routes").then(m => m.PUBLIC_ROUTES),
      },
    ],
  },

  // Auth de tenant
  {
    path: "auth",
    component: AuthLayout,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/auth/auth.routes").then(m => m.AUTH_ROUTES),
      },
    ],
  },

  // Auth de superadmin (plataforma)
  {
    path: "",
    component: AdminAuthLayout,
    children: [
      {
        path: "platform/auth",
        loadChildren: () =>
          import("./features/auth/auth.routes").then(m => m.ADMIN_ROUTES),
      },
    ],
  },

  // Panel de Superadmin (Plataforma) protegido por guard
  {
    path: "platform",
    component: PlatformLayout,
    canActivate: [platformGuard],
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/platform/platform.routes").then(m => m.PLATFORM_ROUTES),
      },
    ],
  },

  // Rutas privadas del tenant
  {
    path: "app",
    component: AppLayout,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./features/dashboard/dashboard.routes").then(
            m => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: "dashboard",
        loadChildren: () =>
          import("./features/dashboard/dashboard.routes").then(
            m => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: "users",
        loadChildren: () =>
          import("./features/users/users.routes").then(m => m.USERS_ROUTES),
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./features/reports/reports.routes").then(
            m => m.REPORTS_ROUTES
          ),
      },
      {
        path: "settings",
        loadChildren: () =>
          import("./features/settings/settings.routes").then(
            m => m.SETTINGS_ROUTES
          ),
      },
    ],
  },

  // Ruta comodín
  {
    path: "**",
    redirectTo: "",
  },
];
