import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Users } from '../../../models/accounts/users';
import { LoanAccount } from '../../../models/accounts/LoanAccount';
import { FormControl, NgModel, Validators } from '@angular/forms';
import {
  Loans,
  LoanStatus,
  PaymentSchedule,
  PaymentStatus,
} from '../../../models/loans/loan';
import { generateRandomNumber } from '../../../utils/Constants';
import { ConfirmLoanComponent } from '../confirm-loan/confirm-loan.component';
import { LoanHistory } from '../../../models/loans/loan-history';
import { LoanService } from '../../../services/loan.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-make-loan',
  templateUrl: './make-loan.component.html',
  styleUrl: './make-loan.component.css',
})
export class MakeLoanComponent implements OnInit {
  modalService = inject(NgbModal);
  activeModal = inject(NgbActiveModal);
  @Input() user!: Users;
  @Input() loanAccount!: LoanAccount;
  loading$ = false;
  constructor(
    private loanService: LoanService,
    private toastr: ToastrService
  ) {}

  amountControl: FormControl | undefined;
  ngOnInit(): void {
    this.amountControl = new FormControl(0, [
      Validators.required,
      Validators.max(this.loanAccount.amount),
    ]);
  }

  submitLoan() {
    if (this.amountControl!.valid) {
      const amount = this.amountControl?.value ?? 0;
      const interestAmount = amount * (this.loanAccount.interest / 100);
      const amountWithInterest = amount + interestAmount;

      const days = this.loanAccount.payableDays;

      const paymentSchedule = this.createPaymentSchedule(
        days,
        amountWithInterest
      );

      let loan: Loans = {
        id: generateRandomNumber(),
        loanAccountID: this.loanAccount.id,
        amount: amountWithInterest,
        interest: this.loanAccount.interest,
        amountPaid: 0,
        paymentSchedule: paymentSchedule,
        status: LoanStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.confirmLoan(loan, amount);
    } else {
      this.toastr.error('Invalid loan amount');
    }
  }

  confirmLoan(loan: Loans, loanWithoutInterest: number) {
    const modal = this.modalService.open(ConfirmLoanComponent);
    modal.componentInstance.loan = loan;
    modal.componentInstance.days = this.loanAccount.payableDays;
    modal.componentInstance.start = loan.paymentSchedule[0].date.toDateString();
    modal.componentInstance.end =
      loan.paymentSchedule[loan.paymentSchedule.length - 1].date.toDateString();

    modal.result.then((data: any) => {
      if (data == 'YES') {
        this.saveLoan(loan, loanWithoutInterest);
      }
    });
  }
  saveLoan(loan: Loans, loanWithoutInterest: number) {
    this.loading$ = true;
    const history: LoanHistory = {
      id: generateRandomNumber(),
      borrowerID: this.user.username,
      loanID: loan.id,
      message: `Loan Approved`,
      createdAt: new Date(),
      amount: loan.amount,
    };
    this.loanService
      .acceptLoan(loan, history, loanWithoutInterest)
      .then(() => this.toastr.success('Loan success'))
      .catch((err) => this.toastr.error(err['message']))
      .finally(() => {
        this.activeModal.close();
        this.loading$ = false;
      });
  }

  createPaymentSchedule(days: number, totalAmount: number): PaymentSchedule[] {
    const schedules: PaymentSchedule[] = [];
    const dailyAmount = totalAmount / days;

    // Start from tomorrow
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    currentDate.setHours(0, 0, 0, 0); // Ensure the time is set to midnight

    for (let i = 0; i < days; i++) {
      schedules.push({
        days: i + 1,
        amount: parseFloat(dailyAmount.toFixed(2)), // Ensure proper rounding
        date: new Date(currentDate), // Clone the current date
        status: PaymentStatus.UNPAID, // Default status
      });

      // Increment date by 1 day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return schedules;
  }
}
