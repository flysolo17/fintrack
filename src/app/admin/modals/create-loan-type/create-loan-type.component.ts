import { Component, inject } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoanTypeService } from '../../../services/loan-type.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoanTypes } from '../../../models/loans/loan-types';
import { generateRandomString } from '../../../utils/Constants';

@Component({
  selector: 'app-create-loan-type',
  templateUrl: './create-loan-type.component.html',
  styleUrl: './create-loan-type.component.css',
})
export class CreateLoanTypeComponent {
  activeModal = inject(NgbActiveModal);
  loanTypeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loanTypeService: LoanTypeService
  ) {
    this.loanTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      interest: [0, Validators.required],
    });
  }
  onSubmit() {
    if (this.loanTypeForm.valid) {
      const newLoanType: LoanTypes = {
        id: generateRandomString(10),
        ...this.loanTypeForm.value,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.loanTypeService.createLoanType(newLoanType);
      this.activeModal.close(newLoanType);
    }
  }
}
