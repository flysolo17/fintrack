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
import { FormControl } from '@angular/forms';
import {
  collectedAmountPerDay,
  getDailyPayableAmountWithoutInterest,
} from '../../utils/Constants';
import CanvasJS from 'canvasjs';

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

export interface GroupLoanHistory {
  day: string; //MMM dd
  histories: LoanHistory[];
}

@Component({
  selector: 'app-collector-performance',
  templateUrl: './collector-performance.component.html',
  styleUrl: './collector-performance.component.css',
})
export class CollectorPerformanceComponent implements OnInit {
  loans$: Observable<Loans[]> = this.loanService.getAllLoans();
  loanData: Loans[] = [];
  collectors$: Observable<Users[]> = this.authService.getAllCollectors();
  history$: Observable<LoanHistory[]> =
    this.loanHistoryService.getAllLoanHistory();
  collectorPerformance$: Observable<GroupCollectorPerformance[]> | undefined;
  chartOptions$: Observable<any> | undefined;
  filteredCollectorPerformance: GroupCollectorPerformance[] = [];
  searchTerm = new FormControl('');

  active = 'all';

  grouppedLoanHistories$: Observable<GroupLoanHistory[]> = this.history$.pipe(
    map((histories: LoanHistory[]) => {
      const grouped = histories.reduce((acc, history) => {
        const date = new Date(history.createdAt);
        const day = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        if (!acc[day]) {
          acc[day] = { day, histories: [] };
        }
        acc[day].histories.push(history);

        return acc;
      }, {} as { [key: string]: GroupLoanHistory });

      return Object.values(grouped).sort((a, b) => {
        const dateA = new Date(a.histories[0].createdAt).getTime();
        const dateB = new Date(b.histories[0].createdAt).getTime();
        return dateA - dateB;
      });
    })
  );

  filteredGrouppedLoanHistories$ = this.grouppedLoanHistories$;

  selectActiveTab(collectorID: string) {
    this.active = collectorID;
    if (this.active === 'all') {
      this.filteredGrouppedLoanHistories$ = this.grouppedLoanHistories$;

      this.initCollectorGraph();
    } else {
      this.filteredGrouppedLoanHistories$ = this.grouppedLoanHistories$.pipe(
        map((histories) =>
          histories
            .map((e) => ({
              ...e,
              histories: e.histories.filter(
                (history) => history.collectorID === collectorID
              ),
            }))
            .filter((e) => e.histories.length > 0)
        )
      );

      this.initCollectorGraph();
    }
  }
  computeTotalPerDay(history: LoanHistory[]) {
    return collectedAmountPerDay(history);
  }

  collector$: Observable<any> | undefined;

  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private loanHistoryService: HistoryService,
    private pdfGenerationService: PdfGenerationService
  ) {}

  ngOnInit(): void {
    this.initCollectorGraph();
    this.collectorPerformance$ = combineLatest([
      this.loans$,
      this.collectors$,
      this.history$,
    ]).pipe(
      map(([loans, collectors, histories]) => {
        this.loanData = loans;
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
        this.filteredCollectorPerformance = groups; // Set initial data
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
  }

  initCollectorGraph() {
    this.collector$ = this.filteredGrouppedLoanHistories$.pipe(
      map((groups) => ({
        animationEnabled: true,
        title: { text: 'Loan History' },
        axisX: { title: 'Day', interval: 1 },
        axisY: { title: 'Amount & Profit (PHP)' },
        data: [
          {
            type: 'column',
            name: 'Total Amount',
            showInLegend: true,
            dataPoints: groups.map((group) => ({
              label: group.day,
              y: this.computeTotalPerDay(group.histories),
            })),
          },
          {
            type: 'column',
            name: 'Total Profit',
            showInLegend: true,
            dataPoints: groups.map((group) => ({
              label: group.day,
              y: this.computeProfit(group.histories, this.loanData),
            })),
          },
        ],
      }))
    );
  }

  onSearch(): void {
    const searchTermLower = this.searchTerm.value?.toLowerCase();

    this.collectorPerformance$?.subscribe((groups) => {
      this.filteredCollectorPerformance = groups.map((group) => ({
        ...group,
        performance: group.performance.filter((performance) =>
          performance.collectorName
            .toLowerCase()
            .includes(searchTermLower ?? '')
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
    );
    const profit = this.calculateTotalProfit(
      collectedHistories,
      collector.id,
      loans
    );

    return {
      collectorName: `${collector.firstName} ${collector.lastName}`,
      assignedLoans: assignedLoans.length,
      totalLoansCollected,
      totalAmountCollected,
      profit,
    };
  }

  computeProfit(collectorHistories: LoanHistory[], loans: Loans[]): number {
    let totalProfit = 0;

    collectorHistories
      .filter((e) => e.status !== PaymentStatus.UNPAID)
      .forEach((history) => {
        const loan = loans.find((l) => l.id === history.loanID);
        if (loan && loan.paymentSchedule?.length > 0) {
          const interestAmount = (loan.amount * loan.interest) / 100;
          const totalPayableAmount = loan.amount + interestAmount;
          const dailyPayableAmount =
            totalPayableAmount / loan.paymentSchedule.length;

          const dailyPayableAmountWithoutInterest =
            loan.amount / loan.paymentSchedule.length;

          loan.paymentSchedule.forEach((schedule: PaymentSchedule) => {
            if (schedule.status !== PaymentStatus.UNPAID) {
              const profitPerDay =
                dailyPayableAmount - dailyPayableAmountWithoutInterest;

              totalProfit += profitPerDay;
            }
          });
        }
      });
    return totalProfit;
  }

  private calculateTotalProfit(
    collectorHistories: LoanHistory[],
    collectorID: string,
    loans: Loans[]
  ): number {
    let totalProfit = 0;

    collectorHistories
      .filter(
        (e) =>
          e.status !== PaymentStatus.UNPAID && e.collectorID === collectorID
      )
      .forEach((history) => {
        const loan = loans.find((l) => l.id === history.loanID);
        if (loan && loan.paymentSchedule?.length > 0) {
          const interestAmount = (loan.amount * loan.interest) / 100;
          const totalPayableAmount = loan.amount + interestAmount;
          const dailyPayableAmount =
            totalPayableAmount / loan.paymentSchedule.length;

          const dailyPayableAmountWithoutInterest =
            loan.amount / loan.paymentSchedule.length;

          loan.paymentSchedule.forEach((schedule: PaymentSchedule) => {
            if (schedule.status !== PaymentStatus.UNPAID) {
              const profitPerDay =
                dailyPayableAmount - dailyPayableAmountWithoutInterest;

              totalProfit += profitPerDay;
            }
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
