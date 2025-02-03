import { Component, inject, OnInit } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { PaymentSchedule, PaymentStatus } from '../../models/loans/loan';
import { LoanWithUser } from '../../models/loans/LoanWithUser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentDialogComponent } from '../modals/payment-dialog/payment-dialog.component';
import { Users } from '../../models/accounts/users';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';
import { LoanHistory } from '../../models/loans/loan-history';
import { HistoryService } from '../../services/history.service';
import { computeTotalCollected } from '../../utils/Constants';
import { PdfGenerationService } from '../../services/pdf-generation.service';

export interface PaymentRow {
  loanWithUser: LoanWithUser;
  date: string;
  customer: string;
  amount: string;
  status: PaymentStatus;
  schedule: PaymentSchedule;
}

@Component({
  selector: 'app-daily-payment',
  templateUrl: './daily-payment.component.html',
  styleUrls: ['./daily-payment.component.css'],
})
export class DailyPaymentComponent implements OnInit {
  modalService = inject(NgbModal);
  selectedDate: Date = new Date();
  filteredPayments: PaymentRow[] = [];
  payments: PaymentRow[] = [];
  users$: Users | null = null;

  history$: LoanHistory[] = [];
  totalCollected$ = 0;
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private historyService: HistoryService,
    private pdfGeneration: PdfGenerationService
  ) {}
  generatePdf(paymenRow: PaymentRow[]) {
    this.pdfGeneration.downloadDailyPayment(paymenRow, this.totalCollected$);
  }

  ngOnInit(): void {
    this.getTotalCollected(new Date());
    const id = localStorage.getItem('uid') ?? '';
    if (id !== '') {
      this.authService.getUserByID(id).subscribe((data) => {
        this.users$ = data;
      });
    }
    this.loanService.getPaymentsWithUser().subscribe(
      (data) => {
        console.log(data);
        this.payments = [];
        data.forEach((loan) => {
          loan.loan?.paymentSchedule.forEach((payment) => {
            this.payments.push({
              loanWithUser: loan,
              date: this.formatDate(payment.date),
              customer: `${loan.users?.firstName} ${loan.users?.lastName}`,
              amount: payment.amount.toString(),
              status: payment.status,
              schedule: payment,
            });
          });
        });
        console.log('Payments: ', this.payments);
        this.filterPaymentsByDate();
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );
  }

  getTotalCollected(date: Date) {
    this.historyService.getTotalCollected(date).subscribe((data) => {
      this.history$ = data;
      console.log('COllected', data);
      this.totalCollected$ = computeTotalCollected(data);
    });
  }

  setSelectedDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.selectedDate = new Date(input.value);
      this.getTotalCollected(this.selectedDate);
      this.filterPaymentsByDate();
    }
  }

  filterPaymentsByDate(): void {
    const formattedSelectedDate = this.formatDate(this.selectedDate);

    this.filteredPayments = this.payments.filter(
      (payment) => payment.date === formattedSelectedDate
    );
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  get formattedSelectedDate(): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const month = monthNames[this.selectedDate.getMonth()];
    const year = this.selectedDate.getFullYear();
    return `${month} - ${year}`;
  }

  pay(loanWithUser: LoanWithUser, schedule: PaymentSchedule): void {
    const modal = this.modalService.open(PaymentDialogComponent);
    modal.componentInstance.loanWithUser = loanWithUser;
    modal.componentInstance.schedule = schedule;

    modal.result.then(
      (result) => {
        console.log('Payment successful:', result);
        this.filterPaymentsByDate();
      },
      (reason) => {
        console.log('Payment modal dismissed:', reason);
      }
    );
  }

  isScheduledToday(schedule: PaymentSchedule): boolean {
    const today = new Date();
    const scheduledDate = new Date(schedule.date);

    // Return true if both dates match for year, month, and day.
    return (
      today.getFullYear() === scheduledDate.getFullYear() &&
      today.getMonth() === scheduledDate.getMonth() &&
      today.getDate() === scheduledDate.getDate()
    );
  }
}
