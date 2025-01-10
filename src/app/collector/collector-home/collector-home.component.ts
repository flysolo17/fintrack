// Import necessary modules
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { Observable, Subscribable } from 'rxjs';

@Component({
  selector: 'app-collector-home',
  templateUrl: './collector-home.component.html',
  styleUrls: ['./collector-home.component.css'],
})
export class CollectorHomeComponent {
  chartOptions: any;

  constructor(private loanService: LoanService, private router: Router) {
    // Initialize the chart options
    this.chartOptions = this.initializeChartOptions();
  }

  // Method to initialize the chart options for Collector Performance Statistics
  private initializeChartOptions() {
    return {
      animationEnabled: true,
      theme: 'light2',
      title: {
        text: 'Collector Performance - Monthly Statistics',
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
          dataPoints: [
            { label: 'Jan', y: 120 },
            { label: 'Feb', y: 140 },
            { label: 'Mar', y: 170 },
            { label: 'Apr', y: 160 },
            { label: 'May', y: 180 },
            { label: 'Jun', y: 200 },
            { label: 'Jul', y: 190 },
            { label: 'Aug', y: 210 },
            { label: 'Sep', y: 180 },
            { label: 'Oct', y: 170 },
            { label: 'Nov', y: 150 },
            { label: 'Dec', y: 130 },
          ],
        },
        {
          type: 'spline',
          showInLegend: true,
          name: 'Revenue',
          axisYType: 'secondary',
          yValueFormatString: '₱#,###',
          dataPoints: [
            { label: 'Jan', y: 300000 },
            { label: 'Feb', y: 320000 },
            { label: 'Mar', y: 400000 },
            { label: 'Apr', y: 380000 },
            { label: 'May', y: 450000 },
            { label: 'Jun', y: 500000 },
            { label: 'Jul', y: 480000 },
            { label: 'Aug', y: 530000 },
            { label: 'Sep', y: 460000 },
            { label: 'Oct', y: 440000 },
            { label: 'Nov', y: 420000 },
            { label: 'Dec', y: 390000 },
          ],
        },
        {
          type: 'line',
          showInLegend: true,
          name: 'Pending Collections',
          axisYType: 'secondary',
          yValueFormatString: '#,### Pending',
          dataPoints: [
            { label: 'Jan', y: 20 },
            { label: 'Feb', y: 25 },
            { label: 'Mar', y: 30 },
            { label: 'Apr', y: 15 },
            { label: 'May', y: 10 },
            { label: 'Jun', y: 18 },
            { label: 'Jul', y: 22 },
            { label: 'Aug', y: 16 },
            { label: 'Sep', y: 20 },
            { label: 'Oct', y: 25 },
            { label: 'Nov', y: 30 },
            { label: 'Dec', y: 35 },
          ],
        },
      ],
    };
  }
}
