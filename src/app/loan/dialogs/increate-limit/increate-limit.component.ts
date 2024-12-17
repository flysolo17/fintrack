import { Component, inject, Input } from '@angular/core';
import { LoanAccount } from '../../../models/accounts/LoanAccount';
import { LoanService } from '../../../services/loan.service';
import { Users } from '../../../models/accounts/users';
import { LoanHistory } from '../../../models/loans/loan-history';
import { generateRandomNumber } from '../../../utils/Constants';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentStatus } from '../../../models/loans/loan';

@Component({
  selector: 'app-increate-limit',
  templateUrl: './increate-limit.component.html',
  styleUrl: './increate-limit.component.css',
})
export class IncreateLimitComponent {
  @Input() account!: LoanAccount;
  @Input() admin!: Users;
  increaseAmount: number = 0;

  activeModal = inject(NgbActiveModal);
  constructor(
    private loanService: LoanService,
    private toastr: ToastrService
  ) {}
  increaseLimit() {
    let history: LoanHistory = {
      id: generateRandomNumber(8),
      borrowerID: this.account.id,
      collectorID: this.admin.id,
      loanID: this.account.id,
      message: `Your Loan account limit has increase. Congratiolations`,
      amount: this.increaseAmount,
      createdAt: new Date(),
      status: PaymentStatus.UNPAID,
    };
    this.loanService
      .increaseLimit(this.account.id, this.increaseAmount, history)
      .then(() => this.toastr.success('Loan account limit increase'))
      .catch((err) => this.toastr.error(err['message']))
      .finally(() => {
        this.activeModal.close();
      });
  }
}
