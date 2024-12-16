import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Loans } from '../models/loans/loan';
import autoTable from 'jspdf-autotable';
import { Users } from '../models/accounts/users';
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
      `Amount: $${loan.amount.toFixed(2)}`,
      `Interest: ${loan.interest}%`,
      `Amount Paid: $${loan.amountPaid.toFixed(2)}`,
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
      Amount: `$${schedule.amount.toFixed(2)}`, //dito lagay mo peso sign
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
}
