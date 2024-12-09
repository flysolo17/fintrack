import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasJS } from '@canvasjs/angular-charts';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanStatus } from '../../models/loans/loan';
import { combineLatest, map, Observable } from 'rxjs';
import { LoanWithUser } from '../../models/loans/LoanWithUser';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  chartOptions: any;

  loan$: Observable<LoanWithUser[]> = this.loanService.getRecentLoans();

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

  constructor(private router: Router, private loanService: LoanService) {}

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
    this.renderBarChart();
  }

  renderBarChart() {
    const barChart = new CanvasJS.Chart('barChartContainer', {
      animationEnabled: true,
      title: {
        text: 'Loan Amount Over Time',
      },
      axisY: {
        title: 'Loan Amount',
        includeZero: true,
      },
      data: [
        {
          type: 'column', // Bar chart type
          indexLabel: '{y}',
          dataPoints: [
            { x: 1, y: 10000 },
            { x: 2, y: 12000 },
            { x: 3, y: 15000 },
            { x: 4, y: 17000 },
            { x: 5, y: 18000 },
            { x: 6, y: 20000 },
            { x: 7, y: 22000 },
          ],
        },
      ],
    });
    barChart.render();
  }

  renderPieChart(dataPoints: { label: string; y: number }[]) {
    const pieChart = new CanvasJS.Chart('pieChartContainer', {
      animationEnabled: true,
      title: {
        text: 'Loan Status Distribution',
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
}
