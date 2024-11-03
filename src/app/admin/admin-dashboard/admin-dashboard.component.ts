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
  loanWithBorrowerAndCollector =
    this.loanService.getLoanWithBorrowerAndCollector();
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

  acceptLoan(loan: LoanWithBorrowerAndCollector) {
    this.loanService
      .acceptLoan(loan)
      .then(() => {
        this.toastr.success(
          'Loan accepted successfully! Congratulations on your approval.'
        );
        // You can also add additional logic here, like navigating away or updating the UI.
      })
      .catch((error) => {
        console.error('Error accepting loan:', error);
        this.toastr.error('Failed to accept the loan. Please try again later.');
      });
  }
}
