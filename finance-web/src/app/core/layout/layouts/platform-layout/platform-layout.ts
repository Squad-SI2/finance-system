import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PlatformAuthService } from '../../../../features/auth/data-access/platform-auth.service';

@Component({
  selector: 'app-platform-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './platform-layout.html',
  styleUrl: './platform-layout.css',
})
export class PlatformLayout {
  private readonly platformAuthService = inject(PlatformAuthService);

  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  onLogout(): void {
    this.platformAuthService.logout();
  }
}
