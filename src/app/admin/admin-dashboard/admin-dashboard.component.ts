import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasJS } from '@canvasjs/angular-charts';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
 

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  loanStatusData = [
    { label: "Approved", y: 70 },
    { label: "Pending", y: 20 },
    { label: "Rejected", y: 10 }
  ];
chartOptions: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.renderBarChart();
    this.renderPieChart();
  }

  renderBarChart() {
    const barChart = new CanvasJS.Chart("barChartContainer", {
      animationEnabled: true,
      title: {
        text: "Loan Amount Over Time"
      },
      axisY: {
        title: "Loan Amount",
        includeZero: true
      },
      data: [{
        type: "column",  // Bar chart type
        indexLabel: "{y}", 
        dataPoints: [
          { x: 1, y: 10000 },
          { x: 2, y: 12000 },
          { x: 3, y: 15000 },
          { x: 4, y: 17000 },
          { x: 5, y: 18000 },
          { x: 6, y: 20000 },
          { x: 7, y: 22000 }
        ]
      }]
    });
    barChart.render();
  }

  renderPieChart() {
    const pieChart = new CanvasJS.Chart("pieChartContainer", {
      animationEnabled: true,
      title: {
        text: "Loan Status Distribution"
      },
      data: [{
        type: "pie",  
        showInLegend: true,
        indexLabel: "{label}: {y}%",  
        dataPoints: this.loanStatusData
      }]
    });
    pieChart.render();
  }
}