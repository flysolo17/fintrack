import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoanTypeService } from '../../../services/loan-type.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ProductLoan } from '../../../models/loans/loan-types';
import { generateRandomString } from '../../../utils/Constants';

@Component({
  selector: 'app-create-loan-type',
  templateUrl: './create-loan-type.component.html',
  styleUrl: './create-loan-type.component.css',
})
export class CreateLoanTypeComponent implements OnInit {
  @Input() product: ProductLoan | null = null;
  activeModal = inject(NgbActiveModal);

  loanTypeForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private loanTypeService: LoanTypeService
  ) {
    this.loanTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      startingAmount: [0, Validators.required],
      payableDays: [40, [Validators.required, Validators.min(40)]],
      interest: [0, Validators.required],
    });
  }
  ngOnInit(): void {
    if (this.product !== null) {
      this.loanTypeForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        startingAmount: this.product.startingAmount,
        payableDays: this.product.payableDays,
        interest: this.product.interest,
      });
    }
  }
  onSubmit() {
    if (this.loanTypeForm.valid) {
      const newLoanType: ProductLoan = {
        id: this.product?.id ?? generateRandomString(10),
        ...this.loanTypeForm.value,

        createdAt: this.product?.createdAt ?? new Date(),
        updatedAt: new Date(),
      };
      this.loanTypeService.createLoanType(newLoanType);
      this.activeModal.close(newLoanType);
    }
  }
}
