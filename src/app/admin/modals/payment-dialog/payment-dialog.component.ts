import { Component, inject, Input, OnInit } from '@angular/core';
import { LoanWithUser } from '../../../models/loans/LoanWithUser';
import { LoanService } from '../../../services/loan.service';
import { ToastrService } from 'ngx-toastr';
import { LoanHistory } from '../../../models/loans/loan-history';
import { generateRandomNumber } from '../../../utils/Constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth.service';
import { Users } from '../../../models/accounts/users';
import { PaymentSchedule, PaymentStatus } from '../../../models/loans/loan';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.css',
})
export class PaymentDialogComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() loanWithUser!: LoanWithUser;
  @Input() schedule!: PaymentSchedule;
  totalAmountPaid: number = 0;
  users: Users | null = null;
  maxAmount: number = 0;

  constructor(
    private loanService: LoanService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.users = this.authService.users$;
    console.log(this.users);
  }

  payExactAmount() {
    const paymentSchedule = this.loanWithUser.loan?.paymentSchedule.find(
      (schedule) => schedule.status !== 'PAID'
    );
    if (paymentSchedule) {
      this.totalAmountPaid = paymentSchedule.amount;
    }
  }

  payFullBalance() {
    this.maxAmount =
      (this.loanWithUser.loan?.amount ?? 0) -
      (this.loanWithUser.loan?.amountPaid ?? 0);
    this.totalAmountPaid = this.maxAmount;
  }

  submitLoan() {
    if (this.totalAmountPaid <= 0) {
      this.toastr.error('Please enter a valid payment amount');
      return;
    }

    let history: LoanHistory = {
      id: generateRandomNumber(10),
      borrowerID: this.loanWithUser.users?.username ?? '',
      collectorID: this.users?.id ?? '',
      loanID: this.loanWithUser?.loan?.id ?? '',
      message: `Payment update collected by ${this.users?.username} amounted ${this.totalAmountPaid}`,
      amount: this.totalAmountPaid,
      createdAt: new Date(),
      status: PaymentStatus.PAID,
    };

    this.loanService
      .updatePaymentStatusAndAmount(
        this.loanWithUser.loan?.id ?? '',
        this.totalAmountPaid,
        history
      )
      .then(() => {
        this.toastr.success('Payment updated successfully!');
        this.activeModal.close('payment-updated');
      })
      .catch((error) => {
        this.toastr.error('Error updating payment: ' + error.message);
      })
      .finally(() => {
        this.activeModal.close();
      });
  }

  get exactAmount(): number {
    return this.schedule.amount;
  }

  get fullAmmount(): number {
    let maxAmount =
      (this.loanWithUser.loan?.amount ?? 0) -
      (this.loanWithUser.loan?.amountPaid ?? 0);
    return maxAmount;
  }
}
