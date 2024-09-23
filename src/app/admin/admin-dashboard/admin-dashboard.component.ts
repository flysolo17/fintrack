import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}
  logout() {
    this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
      this.router.resetConfig(this.router.config);
    });
  }
}
