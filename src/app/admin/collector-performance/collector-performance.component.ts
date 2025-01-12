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
import { PdfGenerationService } from '../../services/pdf-generation.service';

export interface GroupCollectorPerformance {
  month: string;
  year: string;
  performance: CollectorPerformance[];
}

export interface CollectorPerformance {
  collectorName: string;
  assignedLoans: number;
  totalLoansCollected: number;
  totalAmountCollected: number;
  profit: number;
}

@Component({
  selector: 'app-collector-performance',
  templateUrl: './collector-performance.component.html',
  styleUrl: './collector-performance.component.css',
})
export class CollectorPerformanceComponent implements OnInit {
  loans$: Observable<Loans[]> = this.loanService.getAllLoans();
  collectors$: Observable<Users[]> = this.authService.getAllCollectors();
  history$: Observable<LoanHistory[]> =
    this.loanHistoryService.getAllLoanHistory();

  collectorPerformance$: Observable<GroupCollectorPerformance[]> | undefined;
  chartOptions$: Observable<any> | undefined;
  filteredCollectorPerformance: GroupCollectorPerformance[] = [];
  searchTerm: string = '';
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private loanHistoryService: HistoryService,
    private pdfGenerationService: PdfGenerationService
  ) {}

  ngOnInit(): void {
    this.collectorPerformance$ = combineLatest([
      this.loans$,
      this.collectors$,
      this.history$,
    ]).pipe(
      map(([loans, collectors, histories]) => {
        const groupedHistories = this.groupHistoriesByMonthAndYear(histories);
        const groups = Object.keys(groupedHistories).map((key) => {
          const [year, month] = key.split('-');
          const monthHistories = groupedHistories[key];
          const performance = collectors
            .map((collector) =>
              this.calculatePerformance(collector, loans, monthHistories)
            )
            .sort((a, b) => b.profit - a.profit);
          return { month, year, performance } as GroupCollectorPerformance;
        });
        this.filteredCollectorPerformance = groups;
        return groups;
      })
    );
    this.collectorPerformance$.subscribe();
    this.chartOptions$ = this.collectorPerformance$.pipe(
      map((groups) => ({
        animationEnabled: true,
        title: { text: 'Collector Performance Over Time' },
        axisX: { title: 'Time', interval: 1 },
        axisY: { title: 'Total Amount Collected' },
        data: [
          {
            type: 'column',
            dataPoints: groups.map((group) => ({
              label: `${getMonthName(group.month)} - ${group.year}`,
              y: group.performance.reduce(
                (sum, p) => sum + p.totalAmountCollected,
                0
              ),
            })),
          },
        ],
      }))
    );
    console.log(this.chartOptions$);
  }

  onSearch(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.collectorPerformance$?.subscribe((groups) => {
      this.filteredCollectorPerformance = groups.map((group) => ({
        ...group,
        performance: group.performance.filter((performance) =>
          performance.collectorName.toLowerCase().includes(searchTermLower)
        ),
      }));
    });
  }

  downloadPerformance(group: GroupCollectorPerformance) {
    this.pdfGenerationService.downloadCollectorPerformance(group);
  }

  private groupHistoriesByMonthAndYear(histories: LoanHistory[]): {
    [key: string]: LoanHistory[];
  } {
    return histories.reduce((groups, history) => {
      const date = new Date(history.createdAt);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const key = `${year}-${month}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(history);

      return groups;
    }, {} as { [key: string]: LoanHistory[] });
  }

  private calculatePerformance(
    collector: Users,
    loans: Loans[],
    histories: LoanHistory[]
  ): CollectorPerformance {
    const collectorHistories = histories.filter(
      (history) => history.collectorID === collector.id
    );
    const collectedHistories = collectorHistories.filter(
      (e) => e.status !== PaymentStatus.UNPAID
    );

    const totalLoansCollected = collectedHistories.length;
    const totalAmountCollected = collectedHistories.reduce(
      (sum, history) => sum + history.amount,
      0
    );
    const assignedLoans = loans.filter(
      (loan) => loan.collectorID === collector.id
    ).length;
    const profit = this.calculateTotalProfit(collectedHistories, loans);

    return {
      collectorName: `${collector.firstName} ${collector.lastName}`,
      assignedLoans,
      totalLoansCollected,
      totalAmountCollected,
      profit,
    };
  }

  private calculateTotalProfit(
    collectorHistories: LoanHistory[],
    loans: Loans[]
  ): number {
    let totalProfit = 0;

    collectorHistories.forEach((history) => {
      const loan = loans.find((l) => l.id === history.loanID);
      if (loan && loan.paymentSchedule?.length > 0) {
        const interestAmount = (loan.amount * loan.interest) / 100;
        const principalAmount = loan.amount - interestAmount;
        const dailyPayableAmount =
          principalAmount / loan.paymentSchedule.length;

        loan.paymentSchedule.forEach((schedule: PaymentSchedule) => {
          const profitPerDay = dailyPayableAmount - schedule.amount;
          totalProfit += profitPerDay;
        });
      }
    });

    return totalProfit;
  }

  getFormattedDate(month: string, year: string): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} - ${year}`;
  }
}

export function getMonthName(month: string): string {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return monthNames[parseInt(month) - 1];
}
