import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasJS } from '@canvasjs/angular-charts';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanStatus } from '../../models/loans/loan';

import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  Subscribable,
} from 'rxjs';

import { LoanWithUser } from '../../models/loans/LoanWithUser';
import { ProductLoan } from '../../models/loans/loan-types';
import { LoanTypeService } from '../../services/loan-type.service';
import { ProductWithAvailed } from '../../models/products/ProductWithAvailed';
import { HistoryService } from '../../services/history.service';
import { CollectorWithData } from '../../models/accounts/CollectorWithData';
import { FormControl } from '@angular/forms';

import { PdfGenerationService } from '../../services/pdf-generation.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  downloadPerformancePDF() {
    throw new Error('Method not implemented.');
  }
  downloadBorrowerPDF(_t81: any) {
    throw new Error('Method not implemented.');
  }
  topCollectorsData: any[] = [];
  topCollectorOptions: any;
  loan$: Observable<LoanWithUser[]> = this.loanService.getRecentLoans();
  filteredLoan$: Observable<LoanWithUser[]> = this.loan$;
  searhText$ = new FormControl('');
  approved$: Observable<LoanWithUser[]> = this.loan$.pipe(
    map((loans) =>
      loans.filter((loan) => loan.loan?.status === LoanStatus.CONFIRMED)
    )
  );

  paid$: Observable<LoanWithUser[]> = this.loan$.pipe(
    map((loans) =>
      loans.filter((loan) => loan.loan?.status === LoanStatus.PAID)
    )
  );

  pending$: Observable<LoanWithUser[]> = this.loan$.pipe(
    map((loans) =>
      loans.filter((loan) => loan.loan?.status === LoanStatus.PENDING)
    )
  );

  rejected$: Observable<LoanWithUser[]> = this.loan$.pipe(
    map((loans) =>
      loans.filter((loan) => loan.loan?.status === LoanStatus.DECLINED)
    )
  );
  productsLoansAvailed$: Observable<ProductWithAvailed[]> =
    this.loanTypeService.getProductsAvailed();

  chartData$: Observable<{ labels: string[]; data: number[] }> =
    this.productsLoansAvailed$.pipe(
      map((products) => ({
        labels: products.map((p) => p.name),
        data: products.map((p) => p.availed),
      }))
    );

  chartOptions$: Observable<any> = this.productsLoansAvailed$.pipe(
    map((products) => ({
      animationEnabled: true,
      title: {
        text: 'Total Income',
      },
      data: [
        {
          type: 'pie',
          dataPoints: products.map((product) => ({
            y: product.availed,
            label: product.name,
          })),
        },
      ],
    }))
  );

  topCollectors: CollectorWithData[] = [];
  searchQuery!: FormControl<any>;
  filteredBorrowerPerformance$!:
    | Observable<undefined>
    | Subscribable<undefined>
    | Promise<undefined>;

  constructor(
    private router: Router,
    private loanService: LoanService,
    private loanTypeService: LoanTypeService,
    private historyService: HistoryService,
    @Inject(PdfGenerationService)
    private pdfGenerationService: PdfGenerationService
  ) {}

  loanStatusData$: Observable<{ label: string; y: number }[]> = combineLatest([
    this.approved$,
    this.pending$,
    this.rejected$,
    this.paid$,
  ]).pipe(
    map(([approved, pending, rejected, paid]) => [
      { label: 'Approved', y: approved.length },
      { label: 'Pending', y: pending.length },
      { label: 'Rejected', y: rejected.length },
      { label: 'Paid Loans', y: paid.length },
    ])
  );

  ngOnInit() {
    this.loanStatusData$.subscribe((data) => {
      this.renderPieChart(data);
    });
    this.searhText$.valueChanges
      .pipe(
        debounceTime(300), // Add debounce to limit the number of calls
        distinctUntilChanged() // Only trigger when the search term actually changes
      )
      .subscribe((searchText) => {
        this.filterLoans(searchText ?? '');
      });

    this.historyService.getTopCollectors().subscribe((data) => {
      this.topCollectorsData = data.map((collector) => ({
        label: collector.name,
        y: collector.totalAmountCollected,
      }));
      this.topCollectors = data;
      console.log(data);
    });

    this.topCollectorOptions = {
      animationEnabled: true,
      title: {
        text: 'Top Collectors',
      },
      axisY: {
        title: 'Total Amount Collected',
        prefix: '$',
      },
      data: [
        {
          type: 'column', // Choose the chart type (column, bar, line, etc.)
          dataPoints: this.topCollectorsData.map((product) => ({
            y: product.availed,
            label: product.name,
          })),
        },
      ],
    };
  }

  renderPieChart(dataPoints: { label: string; y: number }[]) {
    const pieChart = new CanvasJS.Chart('pieChartContainer', {
      animationEnabled: true,
      title: {
        text: 'Total Loan Amount Distributed',
      },
      data: [
        {
          type: 'pie',
          showInLegend: true,
          indexLabel: '{label}: {y}%',
          dataPoints: dataPoints,
        },
      ],
    });
    pieChart.render();
  }

  download() {
    this.loan$.subscribe((data) => {
      this.pdfGenerationService.downloadLoanWithUsers(data);
    });
  }

  private filterLoans(searchText: string): void {
    this.filteredLoan$ = this.loan$.pipe(
      map((loans) => {
        const searchTermLower = searchText.toLowerCase();
        return loans.filter(
          (loan) =>
            loan.users?.firstName.toLowerCase().includes(searchTermLower) ||
            loan.users?.lastName.toLowerCase().includes(searchTermLower) ||
            loan.loan?.id.toLowerCase().includes(searchTermLower) // Example of filtering by loan account ID
        );
      })
    );
  }
}
