import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanWithBorrowerAndCollector } from '../../models/loans/LoanWithUserAndCollector';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  loanWithBorrowerAndCollector = [];
  constructor(
    private router: Router,
    private loanService: LoanService,
    private toastr: ToastrService
  ) {}
  logout() {
    this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
      this.router.resetConfig(this.router.config);
    });
  }
}
