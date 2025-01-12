import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Loans } from '../models/loans/loan';
import autoTable from 'jspdf-autotable';
import { Users } from '../models/accounts/users';
import {
  getMonthName,
  GroupCollectorPerformance,
} from '../admin/collector-performance/collector-performance.component';
import { BorrowerPerformanceData } from '../collector/performance/performance.component';
@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  private logoImage: HTMLImageElement;

  constructor() {
    // Preload the logo during service initialization
    this.logoImage = new Image();
    this.logoImage.src = '../../../assets/logo_1.png';
    this.logoImage.onerror = () => console.error('Failed to load logo image.');
  }

  createPDF(loan: Loans, loanOfficer: Users | null = null) {
    const doc = new jsPDF();

    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2; // Center horizontally
    const y = 10; // Top margin

    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    doc.setFontSize(18);
    doc.text('Loan Summary', pageWidth / 2, y + imgHeight + 10, {
      align: 'center',
    });

    const details = [
      `Loan ID: ${loan.id}`,
      `Loan Account ID: ${loan.loanAccountID}`,
      `Amount: ₱${loan.amount.toFixed(2)}`,
      `Interest: ${loan.interest}%`,
      `Amount Paid: ₱${loan.amountPaid.toFixed(2)}`,
      `Status: ${loan.status}`,
      `Created At: ${loan.createdAt.toLocaleDateString()}`,
      `Updated At: ${loan.updatedAt.toLocaleDateString()}`,
    ];

    doc.setFontSize(12);
    details.forEach((line, index) => {
      doc.text(line, 15, y + imgHeight + 20 + index * 7); // Position text under the logo
    });

    if (loanOfficer !== null) {
      const fullname = `${loanOfficer.firstName} ${
        loanOfficer.middleName || ''
      } ${loanOfficer.lastName}`.trim();
      doc.setFontSize(12);
      doc.text(`Loan Officer: ${fullname}`, 15, y + imgHeight + 25);
    }

    const tableData = loan.paymentSchedule.map((schedule) => ({
      Days: schedule.days,
      Amount: `₱${schedule.amount.toFixed(2)}`,
      Date: schedule.date.toLocaleDateString(),
      Status: schedule.status,
    }));

    autoTable(doc, {
      startY: y + imgHeight + 80,
      head: [['Days', 'Amount', 'Date', 'Status']],
      body: tableData.map((item) => [
        item.Days,
        item.Amount,
        item.Date,
        item.Status,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] }, // Stylish header
      bodyStyles: { fontSize: 10 },
    });

    // Save the PDF
    doc.save(`${loan.id}.pdf`);
  }

  downloadCollectorPerformance(group: GroupCollectorPerformance) {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;
    const y = 10; // Top margin

    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    doc.setFontSize(18);
    doc.text('Collector Performance', pageWidth / 2, y + imgHeight + 10, {
      align: 'center',
    });

    doc.setFontSize(14);
    doc.text(`Month: ${getMonthName(group.month)}`, 15, y + imgHeight + 20);
    doc.text(`Year: ${group.year}`, 15, y + imgHeight + 30);

    const tableData = group.performance.map((performance) => ({
      Collector: performance.collectorName,
      'Assigned Loans': performance.assignedLoans,
      'Total Loans Collected': performance.totalLoansCollected,
      'Total Amount Collected': `₱${performance.totalAmountCollected.toFixed(
        2
      )}`,
      Profit: `₱${(
        performance.profit - performance.totalAmountCollected
      ).toFixed(2)}`,
    }));

    autoTable(doc, {
      startY: y + imgHeight + 40,
      head: [
        [
          'Collector',
          'Assigned Loans',
          'Total Loans Collected',
          'Total Amount Collected',
          'Profit',
        ],
      ],
      body: tableData.map((item) => [
        item.Collector,
        item['Assigned Loans'],
        item['Total Loans Collected'],
        item['Total Amount Collected'],
        item.Profit,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      bodyStyles: { fontSize: 10 },
    });

    const fileName = `${group.month}-${group.year}.pdf`;
    doc.save(fileName);
  }

  downloadBorrowerData(data: BorrowerPerformanceData) {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;
    const y = 10;

    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    doc.setFontSize(18);
    doc.text('Borrower Performance Data', pageWidth / 2, y + imgHeight + 10, {
      align: 'center',
    });

    const user = data.user;
    const userDetails = user
      ? [
          `Name: ${user.firstName} ${user.middleName || ''} ${user.lastName}`,
          `Email: ${user.email}`,
          `Phone: ${user.phone}`,
        ]
      : ['User: N/A'];

    const details = [
      ...userDetails,
      `Credit Score: ${data.creditScore}`,
      `Total Loans: ${data.totalLoans}`,
      `Active Loans: ${data.activeLoans}`,
      `Total Overdues: ${data.totalOverdues}`,
      `Total Paid: ₱${data.totalPaid.toFixed(2)}`,
    ];

    doc.setFontSize(12);
    details.forEach((line, index) => {
      doc.text(line, 15, y + imgHeight + 20 + index * 7);
    });

    const fileName = user
      ? `${user.firstName}_${user.lastName}_performance.pdf`
      : 'borrower_performance.pdf';
    doc.save(fileName);
  }

  downloadBorrowerPerformanceArray(dataArray: BorrowerPerformanceData[]) {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;
    const y = 10;

    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    doc.setFontSize(18);
    doc.text('Borrower Performance Data', pageWidth / 2, y + imgHeight + 10, {
      align: 'center',
    });

    const tableData = dataArray.map((data) => {
      const user = data.user;
      const userDetails = user
        ? `${user.firstName} ${user.middleName || ''} ${user.lastName}`
        : 'N/A';
      return {
        Name: userDetails,
        'Credit Score': data.creditScore,
        'Total Loans': data.totalLoans,
        'Active Loans': data.activeLoans,
        'Total Overdues': data.totalOverdues,
        'Total Paid': `₱${data.totalPaid.toFixed(2)}`,
      };
    });

    autoTable(doc, {
      startY: y + imgHeight + 20,
      head: [
        [
          'Name',
          'Credit Score',
          'Total Loans',
          'Active Loans',
          'Total Overdues',
          'Total Paid',
        ],
      ],
      body: tableData.map((item) => [
        item.Name,
        item['Credit Score'],
        item['Total Loans'],
        item['Active Loans'],
        item['Total Overdues'],
        item['Total Paid'],
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      bodyStyles: { fontSize: 10 },
    });

    doc.save('borrower_performances.pdf');
  }
}
