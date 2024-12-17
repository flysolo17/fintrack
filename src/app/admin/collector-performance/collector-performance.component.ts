import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { AuthService } from '../../services/auth.service';
import { combineLatest, map, Observable } from 'rxjs';
import {
  Loans,
  LoanStatus,
  PaymentSchedule,
  PaymentStatus,
} from '../../models/loans/loan';
import { Users } from '../../models/accounts/users';
import { LoanHistory } from '../../models/loans/loan-history';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-collector-performance',
  templateUrl: './collector-performance.component.html',
  styleUrl: './collector-performance.component.css',
})
export class CollectorPerformanceComponent implements OnInit {
  loans$: Observable<Loans[]> = this.loanService.getAllLoans();
  collectors$: Observable<Users[]> = this.authService.getAllCollectors();
  histor$: Observable<LoanHistory[]> =
    this.loanHistoryService.getAllLoanHistory();

  collectorPerformance$: Observable<any[]> | undefined;
  chartOptions: any;
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private loanHistoryService: HistoryService
  ) {}
  ngOnInit(): void {
    this.collectorPerformance$ = combineLatest([
      this.loans$,
      this.collectors$,
      this.histor$,
    ]).pipe(
      map(([loans, collectors, histories]) => {
        const chartData = [];
        return collectors.map((collector) => {
          const collectorHistories = histories.filter(
            (history) => history.collectorID === collector.id
          );

          const totalLoansCollected = collectorHistories.filter(
            (e) => e.status !== PaymentStatus.UNPAID
          ).length;
          const totalAmountCollected = collectorHistories
            .filter((e) => e.status !== PaymentStatus.UNPAID)
            .reduce((sum, history) => sum + history.amount, 0);

          const assignedLoans = loans.filter(
            (loan) => loan.collectorID === collector.id
          ).length;

          let totalProfit = 0;

          collectorHistories
            .filter((e) => e.status !== PaymentStatus.UNPAID)
            .forEach((history) => {
              const loan = loans.find((l) => l.id === history.loanID);
              if (
                loan &&
                loan.paymentSchedule &&
                loan.paymentSchedule.length > 0
              ) {
                const principalAmount = loan.amount - loan.interest;
                const dailyPayableAmount =
                  principalAmount / loan.paymentSchedule.length;
                loan.paymentSchedule.forEach((schedule: PaymentSchedule) => {
                  const profitPerDay = dailyPayableAmount - schedule.amount;
                  totalProfit += profitPerDay;
                });
              }
            });
          chartData.push({
            label: `${collector.firstName} ${collector.lastName}`,
            totalLoansCollected,
            totalProfit,
          });

          return {
            collectorName: `${collector.firstName} ${collector.lastName}`,
            assignedLoans,
            totalLoansCollected,
            totalAmountCollected,
            profit: totalProfit,
          };
        });
      })
    );
  }
}
