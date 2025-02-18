import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Loans, PaymentSchedule } from '../models/loans/loan';
import autoTable from 'jspdf-autotable';
import { Users } from '../models/accounts/users';
import {
  getMonthName,
  GroupCollectorPerformance,
} from '../admin/collector-performance/collector-performance.component';
import { BorrowerPerformanceData } from '../collector/performance/performance.component';
import { UserWithLoanAccount } from '../models/accounts/UserWithLoanAccount';
import { LoanWithUser } from '../models/loans/LoanWithUser';
import { PaymentRow } from '../admin/daily-payment/daily-payment.component';

@Injectable({
  providedIn: 'root',
})
export class PdfGenerationService {
  private logoImage: HTMLImageElement;

  formatDate(date: Date): string {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  constructor() {
    // Preload the logo during service initialization
    this.logoImage = new Image();
    this.logoImage.src = '../../../assets/logo_1.png';
    this.logoImage.onerror = () => console.error('Failed to load logo image.');
  }

  private formatCurrency(value: number): string {
    return `${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      currency: 'PHP',
    })}`;
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
      `Amount: ${this.formatCurrency(loan.amount)}`,
      `Interest: ${loan.interest}%`,
      `Amount Paid: ${this.formatCurrency(loan.amountPaid)}`,
      `Status: ${loan.status}`,
      `Created At: ${loan.createdAt.toLocaleDateString()}`,
      `Updated At: ${loan.updatedAt.toLocaleDateString()}`,
    ];

    doc.setFontSize(12);
    details.forEach((line, index) => {
      doc.text(line, 15, y + imgHeight + 20 + index * 7);
    });

    if (loanOfficer) {
      const fullname = `${loanOfficer.firstName} ${
        loanOfficer.middleName || ''
      } ${loanOfficer.lastName}`.trim();
      doc.text(
        `Loan Officer: ${fullname}`,
        15,
        y + imgHeight + 20 + details.length * 7
      );
    }

    const tableData = loan.paymentSchedule.map((schedule) => ({
      Days: schedule.days,
      Amount: this.formatCurrency(schedule.amount),
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
      headStyles: { fillColor: [22, 160, 133] },
      bodyStyles: { fontSize: 10 },
    });

    doc.save(`${loan.id}.pdf`);
  }

  downloadCollectorPerformance(group: GroupCollectorPerformance) {
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
      'Total Amount Collected': this.formatCurrency(
        performance.totalAmountCollected
      ),
      Profit: this.formatCurrency(
        performance.profit - performance.totalAmountCollected
      ),
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

    doc.save(`${group.month}-${group.year}.pdf`);
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
      `Total Paid: ${this.formatCurrency(data.totalPaid)}`,
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
        'Total Paid': this.formatCurrency(data.totalPaid),
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
  downLoadUserWithLoanAccount(userWithLoanAccount: UserWithLoanAccount) {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;
    const y = 10;

    // Add logo if available
    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    // Title
    doc.setFontSize(18);
    doc.text(
      'User with Loan Account Information',
      pageWidth / 2,
      y + imgHeight + 10,
      {
        align: 'center',
      }
    );

    // User details
    const user = userWithLoanAccount.user;
    const loanAccount = userWithLoanAccount.loanAccount;

    const userDetails = user
      ? [
          `Name: ${user.firstName} ${user.middleName || ''} ${user.lastName}`,
          `Email: ${user.email}`,
          `Phone: ${user.phone}`,
          `Username: ${user.username}`,

          `Created At: ${user.createdAt.toLocaleDateString()}`,
        ]
      : ['User: N/A'];

    const loanDetails = loanAccount
      ? [
          `Loan Account ID: ${loanAccount.id}`,
          `Product Loan ID: ${loanAccount.productLoanID}`,
          `Amount: ${this.formatCurrency(loanAccount.amount)}`,
          `Interest: ${loanAccount.interest}%`,
          `Credit Score: ${loanAccount.creditScore}`,
          `Payable Days: ${loanAccount.payableDays}`,
          `Status: ${loanAccount.status}`,
          `Created At: ${loanAccount.createdAt.toLocaleDateString()}`,
          `Updated At: ${loanAccount.updatedAt.toLocaleDateString()}`,
        ]
      : ['Loan Account: N/A'];

    doc.setFontSize(12);
    let yOffset = y + imgHeight + 20;
    userDetails.forEach((line, index) => {
      doc.text(line, 15, yOffset + index * 7);
    });

    yOffset += userDetails.length * 7;

    loanDetails.forEach((line, index) => {
      doc.text(line, 15, yOffset + index * 7);
    });

    // Save the PDF with a filename
    const fileName = user
      ? `${user.firstName}_${user.lastName}_with_loan_account.pdf`
      : 'user_with_loan_account.pdf';
    doc.save(fileName);
  }

  downloadUserWithLoanAccount(userWithLoanAccount: UserWithLoanAccount[]) {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;
    const y = 10;

    // Add logo if available
    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    // Add title below the logo
    doc.setFontSize(18);
    doc.text(
      'User with Loan Account Information',
      pageWidth / 2,
      y + imgHeight + 10,
      { align: 'center' }
    );

    // Prepare the table data
    const tableData = userWithLoanAccount.map((item) => {
      return {
        'Loan Account': item.loanAccount?.id,
        User: `${item.user?.firstName} ${item.user?.lastName}`,
        Type: item.loanAccount?.name,

        Interest: `${item.loanAccount?.interest}%`,
        'Available Loan': this.formatCurrency(item.loanAccount?.amount ?? 0.0),
        Status: item.loanAccount?.status,
      };
    });

    // Add the table using autoTable
    autoTable(doc, {
      startY: y + imgHeight + 20, // Adjust Y position to avoid overlap with title
      head: [
        [
          'Loan Account',
          'User',
          'Type',
          'Interest',
          'Available Loan',
          'Status',
        ],
      ],
      body: tableData.map((item) => [
        item['Loan Account'] ?? '',
        item['User'] ?? '',
        item['Type'] ?? '',
        item['Interest'] ?? '',
        item['Available Loan'] ?? '',
        item['Status'] ?? '',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      bodyStyles: { fontSize: 10 },
    });

    // Save the PDF with a filename
    doc.save('user_with_loan_account.pdf');
  }

  downloadLoanWithUsers(userWithLoan: LoanWithUser[]) {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;
    const y = 10;

    // Add logo if available
    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    doc.setFontSize(18);
    doc.text('Loan and User Information', pageWidth / 2, y + imgHeight + 10, {
      align: 'center',
    });

    const tableData = userWithLoan.map((item) => {
      const startDate =
        item?.loan?.paymentSchedule?.[0]?.date.toDateString() ?? '';
      const endDate =
        item?.loan?.paymentSchedule?.[
          item?.loan?.paymentSchedule?.length - 1
        ]?.date.toDateString() ?? '';

      const loan = item.loan;
      const user = item.users;
      return [
        loan?.id ?? '',
        `${user?.firstName ?? ''} ${user?.middleName ?? ''} ${
          user?.lastName ?? ''
        }`,
        this.formatCurrency(loan?.amount ?? 0.0),
        loan?.status ?? '',
        startDate,
        endDate,
      ];
    });

    // Add the table using autoTable
    autoTable(doc, {
      startY: y + imgHeight + 20,
      head: [
        ['Loan ID', 'Applicant', 'Amount', 'Status', 'Start Date', 'End Date'],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      bodyStyles: { fontSize: 10 },
    });

    doc.save('loan_with_users.pdf');
  }

  downloadDailyPayment(
    schedules: PaymentRow[],
    collectorName: string,
    totalCollected: number
  ) {
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
    doc.text('Daily Payment', pageWidth / 2, y + imgHeight + 10, {
      align: 'center',
    });

    const formattedDate = this.formatDate(new Date());

    const tableData = schedules.map((item: PaymentRow) => {
      const user = `${item.loanWithUser.users?.firstName ?? ''} ${
        item.loanWithUser.users?.lastName ?? ''
      }`.trim();

      return [
        this.formatDate(new Date(item.date)),
        user,
        this.formatCurrency(Number(item.amount)),
        this.formatCurrency(Number(item.amountPerDay)),
        item.status,
      ];
    });

    // Add table using autoTable
    const tableY = y + imgHeight + 20;
    autoTable(doc, {
      startY: tableY,
      head: [['Date', 'Customer', 'Amount', 'Payment Amount', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      bodyStyles: { fontSize: 10 },
    });

    // Get the last position after the table
    const finalY = (doc as any).lastAutoTable.finalY || tableY + 10;

    doc.setFontSize(12);
    const collectorText = `Collector: ${collectorName}`;
    const totalCollectedText = `Total Collected: ${this.formatCurrency(
      totalCollected
    )}`;

    const marginLeft = 15; // Adjust left margin
    const marginRight = pageWidth - 80; // Adjust right margin for spacing

    doc.text(collectorText, marginLeft, finalY + 10);
    doc.text(totalCollectedText, marginRight, finalY + 10);

    doc.save(`daily_payment_${formattedDate}.pdf`);
  }

  downloadLoanReport(title: string, loanData: LoanWithUser[]) {
    const doc = new jsPDF();
    const imgWidth = 40;
    const imgHeight = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - imgWidth) / 2;
    const y = 10;

    // Add logo if available
    if (this.logoImage.complete && this.logoImage.naturalWidth > 0) {
      doc.addImage(this.logoImage, 'PNG', x, y, imgWidth, imgHeight);
    } else {
      console.warn('Logo not loaded; skipping logo.');
    }

    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y + imgHeight + 10, {
      align: 'center',
    });

    // Get formatted date for filename
    const formattedDate = this.formatDate(new Date());

    // Map loan data to table format
    const tableData = loanData.map((item: LoanWithUser) => {
      const borrower = `${item.users?.firstName ?? ''} ${
        item.users?.lastName ?? ''
      }`.trim();

      return [
        item.loan?.id ?? 'N/A', // Loan ID
        borrower, // Borrower Name
        this.formatCurrency(Number(item.loan?.amount ?? 0)), // Payment Amount
        item.loan?.status ?? 'Unknown', // Status
        this.formatDate(new Date(item.loan?.createdAt ?? '')), // Created At
        this.formatDate(new Date(item.loan?.updatedAt ?? '')), // Last Updated
      ];
    });

    const tableY = y + imgHeight + 20;
    autoTable(doc, {
      startY: tableY,
      head: [
        [
          'Loan ID',
          'Borrower',
          'Payment',
          'Status',
          'Created At',
          'Last Updated',
        ],
      ],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
      bodyStyles: { fontSize: 10 },
    });

    doc.save(`loan_report_${formattedDate}.pdf`);
  }
}
