import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { Observable } from 'rxjs';
import { LoanHistory } from '../../models/loans/loan-history';
import { Loans } from '../../models/loans/loan';
import { PaymentRow } from '../../loan/view-loan/view-loan.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Users } from '../../models/accounts/users';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-borrower-home',
  templateUrl: './borrower-home.component.html',
  styleUrl: './borrower-home.component.css',
})
export class BorrowerHomeComponent implements OnInit {
  histories$: Observable<LoanHistory[]> | undefined;
  activeLoans$: Observable<Loans[]> | undefined;
  payments: PaymentRow[] = [];
  users$: Users | null = null;
  active = 1;
  constructor(
    private loanService: LoanService,
    private router: Router,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.users$ = this.authService.users$;
    let id = localStorage.getItem('uid') ?? '';
    if (this.users$ != null) {
      this.histories$ = this.loanService.getHistory(this.users$.username);
      this.activeLoans$ = this.loanService.getActiveLoans(this.users$.username);

      this.activeLoans$.subscribe((data: Loans[]) => {
        console.log(data);
        data.forEach((e) => {
          let schedules = e.paymentSchedule;
          schedules.forEach((s) => {
            this.payments.push({
              date: this.formatDate(s.date),
              amount: s.amount.toString(),
              status: s.status,
            });
          });
        });
      });
    }

    console.log(id);
  }
  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
      this.router.resetConfig(this.router.config);
    });
  }
}
