import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateLoanTypeComponent } from '../modals/create-loan-type/create-loan-type.component';
import { LoanTypeService } from '../../services/loan-type.service';

@Component({
  selector: 'app-loan-type',
  templateUrl: './loan-type.component.html',
  styleUrl: './loan-type.component.css',
})
export class LoanTypeComponent {
  loanType$ = this.loanTypeService.getAllLoanTypes();
  constructor(
    private modal: NgbModal,
    private loanTypeService: LoanTypeService
  ) {}

  create() {
    const modal = this.modal.open(CreateLoanTypeComponent);
  }
  deleteLoanType(id: string) {
    this.loanTypeService.deleteLoanType(id);
  }
}
