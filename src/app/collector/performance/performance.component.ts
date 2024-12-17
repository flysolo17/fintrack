import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoanService } from '../../services/loan.service';
import { HistoryService } from '../../services/history.service';
import { combineLatest, map, Observable } from 'rxjs';
import { UserWithLoanAccount } from '../../models/accounts/UserWithLoanAccount';
import { Loans, LoanStatus, PaymentStatus } from '../../models/loans/loan';
import { LoanHistory } from '../../models/loans/loan-history';
import { Users } from '../../models/accounts/users';

export interface BorrowerPerformanceData {
  user: Users | null;
  creditScore: number;
  totalLoans: number;
  activeLoans: number;
  totalOverdues: number;
  totalPaid: number;
}
@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css',
})
export class PerformanceComponent implements OnInit {
  usersWithLoans$: Observable<UserWithLoanAccount[]> =
    this.authService.getUserWithLoanAccount();

  loans$: Observable<Loans[]> = this.loanService.getAllLoans();
  histories$: Observable<LoanHistory[]> =
    this.historyService.getAllLoanHistory();

  borrowerPerformance$: Observable<BorrowerPerformanceData[]> | undefined;
  constructor(
    private authService: AuthService,
    private loanService: LoanService,
    private historyService: HistoryService
  ) {}
  ngOnInit(): void {
    this.borrowerPerformance$ = combineLatest([
      this.usersWithLoans$,
      this.loans$,
      this.histories$,
    ]).pipe(
      map(([users, loans, histories]) => {
        return users.map((user) => {
          const userLoans = loans.filter(
            (loan) => loan.loanAccountID === user.loanAccount?.id
          );
          const userHistories = histories.filter(
            (history) => history.borrowerID === user.loanAccount?.id
          );

          // Total Loans
          const totalLoans = userLoans.length;

          // Active Loans
          const activeLoans = userLoans.filter(
            (loan) =>
              loan.status !== 'PAID' && loan.status !== LoanStatus.DECLINED
          ).length;

          // Overdue Loans
          const totalOverdues = userLoans.filter((e) => {
            e.paymentSchedule.forEach(
              (sched) => sched.status == PaymentStatus.OVERDUE
            );
          }).length;

          // Total Paid Amount
          const totalPaid = userHistories
            .filter((e) => e.status != PaymentStatus.UNPAID)
            .reduce((sum, history) => sum + history.amount, 0);

          // Calculate Credit Score (for demonstration, you can replace this logic with actual credit score calculation)
          const creditScore = user.loanAccount?.creditScore || 0;

          return {
            user: user.user,
            creditScore,
            totalLoans,
            activeLoans,
            totalOverdues,
            totalPaid,
          };
        });
      })
    );
  }
}
