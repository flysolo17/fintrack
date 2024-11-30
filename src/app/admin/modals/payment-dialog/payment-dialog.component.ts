import { Component, inject, Input, OnInit } from '@angular/core';
import { LoanWithUser } from '../../../models/loans/LoanWithUser';
import { LoanService } from '../../../services/loan.service';
import { ToastrService } from 'ngx-toastr';
import { LoanHistory } from '../../../models/loans/loan-history';
import { generateRandomNumber } from '../../../utils/Constants';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth.service';
import { Users } from '../../../models/accounts/users';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.css',
})
export class PaymentDialogComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() loanWithUser!: LoanWithUser;
  totalAmountPaid: number = 0;
  users: Users | null = null;
  constructor(
    private loanService: LoanService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.users = this.authService.users$;
    console.log(this.users);
  }

  submitLoan() {
    if (this.totalAmountPaid <= 0) {
      this.toastr.error('Please enter a valid payment amount');
      return;
    }

    let history: LoanHistory = {
      id: generateRandomNumber(10),
      borrowerID: this.loanWithUser.users?.username ?? '',
      loanID: this.loanWithUser?.loan?.id ?? '',
      message: `Payment update collected by ${this.users?.username} amounted ${this.totalAmountPaid}`,
      amount: this.totalAmountPaid,
      createdAt: new Date(),
    };

    // Call the function to update the payment status and amount
    this.loanService
      .updatePaymentStatusAndAmount(
        this.loanWithUser.loan?.id ?? '',
        history,
        this.totalAmountPaid
      )
      .then(() => {
        this.toastr.success('Payment updated successfully!');
        this.activeModal.close('payment-updated'); // Close the modal after success
      })
      .catch((error) => {
        this.toastr.error('Error updating payment: ' + error.message);
      })
      .finally(() => {
        this.activeModal.close();
      });
  }
}
