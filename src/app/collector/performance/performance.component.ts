import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoanService } from '../../services/loan.service';
import { HistoryService } from '../../services/history.service';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { UserWithLoanAccount } from '../../models/accounts/UserWithLoanAccount';
import { Loans, LoanStatus, PaymentStatus } from '../../models/loans/loan';
import { LoanHistory } from '../../models/loans/loan-history';
import { Users } from '../../models/accounts/users';
import { PdfGenerationService } from '../../services/pdf-generation.service';

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
  styleUrls: ['./performance.component.css'],
})
export class PerformanceComponent implements OnInit {
  arr: string[] = ['All', 'Good', 'Deliquent'];
  filterByGoodOrBad(index: number) {
    if (index === 0) {
      this.filteredBorrowerPerformance$ = this.borrowerPerformance$;
    } else {
      const threshold = 75;
      const isGood = index === 1;

      this.filteredBorrowerPerformance$ = this.borrowerPerformance$?.pipe(
        map((p) =>
          p.filter((e) =>
            isGood ? e.creditScore >= threshold : e.creditScore < threshold
          )
        )
      );
    }
  }

  usersWithLoans$: Observable<UserWithLoanAccount[]> =
    this.authService.getUserWithLoanAccount();

  loans$: Observable<Loans[]> = this.loanService.getAllLoans();
  histories$: Observable<LoanHistory[]> =
    this.historyService.getAllLoanHistory();

  borrowerPerformance$: Observable<BorrowerPerformanceData[]> | undefined;
  filteredBorrowerPerformance$:
    | Observable<BorrowerPerformanceData[]>
    | undefined;
  goodBadBorrowersOptions$: Observable<any> | undefined;
  totalLoansOptions$: Observable<any> | undefined;
  activeLoansOptions$: Observable<any> | undefined;

  searchQuery = new FormControl('');
  users$: Observable<Users | null> = of(null);

  constructor(
    private authService: AuthService,
    private loanService: LoanService,
    private historyService: HistoryService,
    private pdfService: PdfGenerationService
  ) {}

  downloadBorrowerPDF(data: BorrowerPerformanceData) {
    this.pdfService.downloadBorrowerData(data);
  }
  downloadPerformancePDF() {
    this.filteredBorrowerPerformance$?.subscribe((data) => {
      this.pdfService.downloadBorrowerPerformanceArray(data);
    });
  }
  ngOnInit(): void {
    const id = localStorage.getItem('uid') ?? '';
    this.users$ = this.authService.getUserByID(id);
    this.borrowerPerformance$ = combineLatest([
      this.usersWithLoans$,
      this.loans$,
      this.histories$,
    ]).pipe(
      map(([users, loans, histories]) =>
        this.calculateBorrowerPerformance(users, loans, histories)
      )
    );

    this.filteredBorrowerPerformance$ = combineLatest([
      this.borrowerPerformance$,
      this.searchQuery.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([data, searchTerm]) =>
        data.filter((item) =>
          `${item.user?.firstName ?? ''} ${item.user?.lastName ?? ''}`
            .toLowerCase()
            .includes(searchTerm?.toLowerCase() ?? '')
        )
      )
    );

    this.goodBadBorrowersOptions$ = this.borrowerPerformance$.pipe(
      map((data) => this.createGoodBadBorrowersOptions(data))
    );

    this.totalLoansOptions$ = this.borrowerPerformance$.pipe(
      map((data) => this.createTotalLoansOptions(data))
    );

    this.activeLoansOptions$ = this.borrowerPerformance$.pipe(
      map((data) => this.createActiveLoansOptions(data))
    );
  }

  private calculateBorrowerPerformance(
    users: UserWithLoanAccount[],
    loans: Loans[],
    histories: LoanHistory[]
  ): BorrowerPerformanceData[] {
    return users.map((user) => {
      const userLoans = loans.filter(
        (loan) => loan.loanAccountID === user.loanAccount?.id
      );
      const userHistories = histories.filter(
        (history) => history.borrowerID === user.loanAccount?.id
      );

      const totalLoans = userLoans.length;

      const activeLoans = userLoans.filter(
        (loan) => loan.status !== 'PAID' && loan.status !== LoanStatus.DECLINED
      ).length;

      let totalOverdues = 0;
      userLoans.forEach((loan) =>
        loan.paymentSchedule.forEach((sched) => {
          if (sched.status === PaymentStatus.OVERDUE) {
            totalOverdues += 1;
          }
        })
      );

      const totalPaid = userHistories
        .filter((e) => e.status !== PaymentStatus.UNPAID)
        .reduce((sum, history) => sum + history.amount, 0);

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
  }

  private createGoodBadBorrowersOptions(data: BorrowerPerformanceData[]): any {
    const goodBorrowers = data.filter((d) => d.creditScore >= 75).length;
    const badBorrowers = data.filter((d) => d.creditScore < 75).length;

    return {
      animationEnabled: true,
      title: { text: 'Good vs Bad Payers' },
      data: [
        {
          type: 'pie',
          dataPoints: [
            { y: goodBorrowers, label: 'Good Payers' },
            { y: badBorrowers, label: 'Bad Payers' },
          ],
        },
      ],
    };
  }

  private createTotalLoansOptions(data: BorrowerPerformanceData[]): any {
    return {
      animationEnabled: true,
      title: { text: 'Total Loans of Borrowers' },
      axisX: { title: 'Borrowers', interval: 1 },
      axisY: { title: 'Total Loans' },
      data: [
        {
          type: 'column',
          dataPoints: data.map((d) => ({
            label: d.user?.firstName,
            y: d.totalLoans,
          })),
        },
      ],
    };
  }

  private createActiveLoansOptions(data: BorrowerPerformanceData[]): any {
    return {
      animationEnabled: true,
      title: { text: 'Total Active Loans of Borrowers' },
      axisX: { title: 'Borrowers', interval: 1 },
      axisY: { title: 'Active Loans' },
      data: [
        {
          type: 'column',
          dataPoints: data.map((d) => ({
            label: d.user?.firstName,
            y: d.activeLoans,
          })),
        },
      ],
    };
  }
}
