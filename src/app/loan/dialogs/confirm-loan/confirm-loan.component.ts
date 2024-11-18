import { Component, inject, Input } from '@angular/core';
import { Loans } from '../../../models/loans/loan';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-loan',
  templateUrl: './confirm-loan.component.html',
  styleUrl: './confirm-loan.component.css',
})
export class ConfirmLoanComponent {
  activeModal = inject(NgbActiveModal);
  @Input() loan!: Loans;

  confirmLoan() {
    this.activeModal.close('YES');
  }
}
