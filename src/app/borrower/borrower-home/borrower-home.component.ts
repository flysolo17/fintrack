import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { Observable, of } from 'rxjs';
import { LoanHistory } from '../../models/loans/loan-history';
import { Loans } from '../../models/loans/loan';
import { PaymentRow } from '../../loan/view-loan/view-loan.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Users } from '../../models/accounts/users';
import { LoanAccount } from '../../models/accounts/LoanAccount';
import { LoanWithUserAndDocuments } from '../../models/loans/LoanWithUserAndDocuments';

@Component({
  selector: 'app-borrower-home',
  templateUrl: './borrower-home.component.html',
  styleUrls: ['./borrower-home.component.css'],
})
export class BorrowerHomeComponent implements OnInit {
  isMobile: any;
  isSidebarVisible: any;
  loan: any;
  toggleSidebar() {
    throw new Error('Method not implemented.');
  }
  uploadSelected($event: File, arg1: number) {
    throw new Error('Method not implemented.');
  }
  histories$: Observable<LoanHistory[]> | undefined;
  activeLoans$: Observable<Loans[]> | undefined;
  paymentHistory$: Observable<PaymentRow[]> = of([]);
  users$: Users | null = null;

  loanAccount$: Observable<LoanAccount | null> | undefined;
  active = 1;
  data$: LoanWithUserAndDocuments | null = null;

  constructor(
    private loanService: LoanService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem('uid') ?? '';
    this.authService.getUserByID(id).subscribe((data) => {
      this.users$ = data;
      if (this.users$) {
        this.histories$ = this.loanService.getHistory(this.users$.username);
        this.activeLoans$ = this.loanService.getActiveLoans(
          this.users$.username
        );
        this.viewLoan(this.users$.username);
        // Process payment schedules into paymentHistory$
        this.activeLoans$?.subscribe((data: Loans[]) => {
          const payments: PaymentRow[] = [];
          data.forEach((loan) => {
            loan.paymentSchedule.forEach((schedule) => {
              payments.push({
                date: this.formatDate(new Date(schedule.date)),
                amount: schedule.amount.toString(),
                status: schedule.status,
              });
            });
          });

          // Assign payments array to paymentHistory$
          this.paymentHistory$ = of(payments);
        });
      }
    });

    console.log(id);
  }

  viewLoan(id: string) {
    this.loanService
      .viewLoanAccount(id)
      .then((data) => {
        this.data$ = data;
        console.log(data);
      })
      .finally();
  }
  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  logout() {
    this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
      this.router.resetConfig(this.router.config);
    });
  }
}
