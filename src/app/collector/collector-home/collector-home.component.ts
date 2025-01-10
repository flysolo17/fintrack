import { Component } from '@angular/core';
import {
  generateRandomNumber,
  generateRandomString,
} from '../../utils/Constants';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-collector-home',
  templateUrl: './collector-home.component.html',
  styleUrl: './collector-home.component.css',
})
export class CollectorHomeComponent {
  chartOptions: any;
  get randomAccountNumber(): string {
    return generateRandomNumber();
  }

  constructor(private loanService: LoanService, private router: Router) {}

  createLoan() {
    const extras = {
      queryParams: {
        account: generateRandomNumber(),
      },
    };
    this.router.navigate(['collector/create-loan'], extras);
  }
}
export class AppComponent {
  chart: any;

  chartOptions = {
    animationEnabled: true,
    theme: 'light2',
    title: {
      text: 'Revenue Analysis',
    },
    axisY: {
      title: 'Number of Orders',
      includeZero: true,
    },
    axisY2: {
      title: 'Total Revenue',
      includeZero: true,
      labelFormatter: (e: any) => {
        var suffixes = ['', 'K', 'M', 'B'];

        var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
        if (order > suffixes.length - 1) order = suffixes.length - 1;

        var suffix = suffixes[order];
        return '$' + e.value / Math.pow(1000, order) + suffix;
      },
    },
    toolTip: {
      shared: true,
    },
    legend: {
      cursor: 'pointer',
      itemclick: function (e: any) {
        if (
          typeof e.dataSeries.visible === 'undefined' ||
          e.dataSeries.visible
        ) {
          e.dataSeries.visible = false;
        } else {
          e.dataSeries.visible = true;
        }
        e.chart.render();
      },
    },
    data: [
      {
        type: 'column',
        showInLegend: true,
        name: 'Revenue',
        axisYType: 'secondary',
        yValueFormatString: '$#,###',
        dataPoints: [
          { label: 'Jan', y: 250000 },
          { label: 'Feb', y: 431000 },
          { label: 'Mar', y: 646000 },
          { label: 'Apr', y: 522000 },
          { label: 'May', y: 464000 },
          { label: 'Jun', y: 470000 },
          { label: 'Jul', y: 534000 },
          { label: 'Aug', y: 407000 },
          { label: 'Sep', y: 484000 },
          { label: 'Oct', y: 465000 },
          { label: 'Nov', y: 424000 },
          { label: 'Dec', y: 231000 },
        ],
      },
      {
        type: 'spline',
        showInLegend: true,
        name: 'No of Orders',
        dataPoints: [
          { label: 'Jan', y: 372 },
          { label: 'Feb', y: 412 },
          { label: 'Mar', y: 572 },
          { label: 'Apr', y: 224 },
          { label: 'May', y: 246 },
          { label: 'Jun', y: 601 },
          { label: 'Jul', y: 642 },
          { label: 'Aug', y: 590 },
          { label: 'Sep', y: 527 },
          { label: 'Oct', y: 273 },
          { label: 'Nov', y: 251 },
          { label: 'Dec', y: 331 },
        ],
      },
    ],
  };
}
