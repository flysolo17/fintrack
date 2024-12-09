import { Component, inject, OnInit } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { PaymentSchedule, PaymentStatus } from '../../models/loans/loan';
import { LoanWithUser } from '../../models/loans/LoanWithUser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentDialogComponent } from '../modals/payment-dialog/payment-dialog.component';

interface PaymentRow {
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

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.loanService.getPaymentsWithUser().subscribe((data) => {
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
    });
  }

  setSelectedDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      this.selectedDate = new Date(input.value);
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
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  get formattedSelectedDate(): string {
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    const year = this.selectedDate.getFullYear();
    return `${year}-${month}-${day}`;
  }

  pay(loanWithUser: LoanWithUser, schedule: PaymentSchedule) {
    const modal = this.modalService.open(PaymentDialogComponent);
    modal.componentInstance.loanWithUser = loanWithUser;
    modal.componentInstance.schedule = schedule;
  }
  isScheduledToday(schedule: PaymentSchedule): boolean {
    const today = new Date();
    const scheduledDate = new Date(schedule.date);

    return (
      today.getFullYear() === scheduledDate.getFullYear() &&
      today.getMonth() === scheduledDate.getMonth() &&
      today.getDate() === scheduledDate.getDate()
    );
  }
}
