import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanHistoryByMonth } from '../../models/loans/loan-history';
import { HistoryService } from '../../services/history.service';
import {
  debounceTime,
  distinctUntilChanged,
  identity,
  Observable,
  of,
} from 'rxjs';
import { Loans, LoanStatus } from '../../models/loans/loan';
import { LoanWithUser } from '../../models/loans/LoanWithUser';
import { FormControl } from '@angular/forms';
import { PdfGenerationService } from '../../services/pdf-generation.service';
import {
  LoanAccount,
  LoanAccountStatus,
} from '../../models/accounts/LoanAccount';
import { AccountStatus } from '../../models/accounts/users';

@Component({
  selector: 'app-collector-home',
  templateUrl: './collector-home.component.html',
  styleUrls: ['./collector-home.component.css'],
})
export class CollectorHomeComponent implements OnInit {
  chartOptions: any;
  loanHistoryByMonth: LoanHistoryByMonth[] = [];
  loansWithUsers: (LoanWithUser & {
    firstSchedule?: Date | null;
    lastSchedule?: Date | null;
  })[] = [];

  filteredLoans: (LoanWithUser & {
    firstSchedule?: Date | null;
    lastSchedule?: Date | null;
  })[] = [];
  active: (LoanWithUser & {
    firstSchedule?: Date | null;
    lastSchedule?: Date | null;
  })[] = [];
  searchText$ = new FormControl('');
  pending: (LoanWithUser & {
    firstSchedule?: Date | null;
    lastSchedule?: Date | null;
  })[] = [];
  defaulted: (LoanWithUser & {
    firstSchedule?: Date | null;
    lastSchedule?: Date | null;
  })[] = [];
  constructor(
    private loanService: LoanService,
    private router: Router,
    private loanHistory: HistoryService,
    private pdfGenerattionService: PdfGenerationService
  ) {
    this.chartOptions = this.initializeChartOptions([]);
  }

  ngOnInit(): void {
    const id = localStorage.getItem('uid') ?? '';
    this.loanService.getLoansByCollectorID(id).subscribe((data) => {
      this.loansWithUsers = data.map((loanWithUser) => {
        console.log(loanWithUser);
        const paymentSchedule = loanWithUser.loan?.paymentSchedule || [];
        return {
          ...loanWithUser,
          firstSchedule:
            paymentSchedule.length > 0 ? paymentSchedule[0].date : null,
          lastSchedule:
            paymentSchedule.length > 0
              ? paymentSchedule[paymentSchedule.length - 1].date
              : null,
        };
      });
      this.active = this.loansWithUsers.filter(
        (e) => e.loanAccount?.status === LoanAccountStatus.ACCEPTED
      );
      this.pending = this.loansWithUsers.filter(
        (e) => e.loanAccount?.status === LoanAccountStatus.PENDING
      );
      this.defaulted = this.loansWithUsers.filter(
        (e) => e.loanAccount?.status === LoanAccountStatus.DEFAULTED
      );
    });

    this.loanHistory
      .getPaidLoanHistoryByCollectorIDGroupByMonth(id)
      .subscribe((data) => {
        this.loanHistoryByMonth = data.reverse();
        this.updateChartOptions();
      });

    this.searchText$.valueChanges
      .pipe(
        debounceTime(300), // Debounce to limit calls while typing
        distinctUntilChanged() // Only trigger when search term changes
      )
      .subscribe((searchText) => {
        this.filterLoans(searchText ?? ''); // Filter loans based on the current search term
      });
  }

  private initializeChartOptions(dataPoints: any[]) {
    return {
      animationEnabled: true,
      theme: 'light2',
      title: {
        text: 'Loans Collected Per month',
      },
      axisY: {
        title: 'Loans Collected',
        includeZero: true,
      },
      axisY2: {
        title: 'Revenue (PHP)',
        includeZero: true,
        labelFormatter: (e: any) => `₱${e.value.toLocaleString()}`,
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: 'pointer',
        itemclick: (e: any) => {
          e.dataSeries.visible = !e.dataSeries.visible;
          e.chart.render();
        },
      },
      data: [
        {
          type: 'column',
          showInLegend: true,
          name: 'Loans Collected',
          yValueFormatString: '#,### Loans',
          dataPoints,
        },
        {
          type: 'spline',
          showInLegend: true,
          name: 'Revenue',
          axisYType: 'secondary',
          yValueFormatString: '₱#,###',
          dataPoints,
        },
      ],
    };
  }

  private updateChartOptions() {
    const loansCollectedDataPoints = this.loanHistoryByMonth.map(
      (monthData) => ({
        label: `${monthData.month} ${monthData.year}`,
        y: monthData.histories.length,
      })
    );

    const revenueDataPoints = this.loanHistoryByMonth.map((monthData) => ({
      label: `${monthData.month} ${monthData.year}`,
      y: monthData.histories.reduce((sum, history) => sum + history.amount, 0),
    }));

    this.chartOptions = this.initializeChartOptions(loansCollectedDataPoints);
    this.chartOptions.data[1].dataPoints = revenueDataPoints;
  }

  downloan() {
    this.pdfGenerattionService.downloadLoanWithUsers(this.loansWithUsers);
  }

  filterLoans(searchText: string = ''): void {
    const lowerSearchText = searchText.toLowerCase();
    console.log('Filtering with:', lowerSearchText); // Debugging search input

    this.filteredLoans = this.loansWithUsers.filter((loanWithUser) => {
      // Match loan ID
      const loanIDMatch = loanWithUser.loan?.id
        .toLowerCase()
        .includes(lowerSearchText);

      // Match applicant name (first, middle, last name)
      const nameMatch = (
        (loanWithUser.users?.firstName || '') +
        ' ' +
        (loanWithUser.users?.middleName || '') +
        ' ' +
        (loanWithUser.users?.lastName || '')
      )
        .toLowerCase()
        .includes(lowerSearchText);

      return loanIDMatch || nameMatch;
    });

    console.log('Filtered Loans:', this.filteredLoans); // Debugging filtered loans
  }
}
