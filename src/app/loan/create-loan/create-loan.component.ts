import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Users, UserType } from '../../models/accounts/users';
import { AuthService } from '../../services/auth.service';
import { LoanTypeService } from '../../services/loan-type.service';
import { Loans, LoanStatus } from '../../models/loans/loan';
import { LoanService } from '../../services/loan.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { ProductLoan } from '../../models/loans/loan-types';
import {
  generateRandomNumber,
  generateRandomString,
} from '../../utils/Constants';
import {
  LoanAccount,
  loanAccountConverter,
  LoanAccountStatus,
} from '../../models/accounts/LoanAccount';
import { PdfGenerationService } from '../../services/pdf-generation.service';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrl: './create-loan.component.css',
})
export class CreateLoanComponent implements OnInit {
  accountID: string | undefined;
  accountInfoForm$: FormGroup;
  loanDetailsForm$: FormGroup;
  collector$: Users | null;
  selectedFiles: any[] = [null, null, null, null, null, null, null];
  loanTypes: ProductLoan[] = [];
  isLoading = false;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private loantypeService: LoanTypeService,
    private loanService: LoanService,
    private toastr: ToastrService,
    private location: Location,
    private pdfService: PdfGenerationService
  ) {
    this.collector$ = authService.users$;
    this.accountInfoForm$ = fb.nonNullable.group({
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(11)]],
      username: ['', Validators.required],
    });

    this.loanDetailsForm$ = this.fb.group({
      type: [null],
      amount: [{ value: '', disabled: true }],
      days: [{ value: '', disabled: true }],
    });
  }
  ngOnInit(): void {
    this.loantypeService.getAllLoanTypes().subscribe((data) => {
      this.loanTypes = data;
    });
    this.route.queryParams.subscribe((params) => {
      this.accountID = params['account'];
      this.accountInfoForm$.controls['username'].setValue(this.accountID);
    });
    this.loanDetailsForm$.get('type')?.valueChanges.subscribe((selectedId) => {
      this.updateLoanDetails(selectedId);
    });
  }

  updateLoanDetails(selectedId: string) {
    const selectedLoan = this.loanTypes.find((loan) => loan.id === selectedId);
    if (selectedLoan) {
      this.loanDetailsForm$.patchValue({
        amount: selectedLoan.startingAmount,
        days: selectedLoan.payableDays,
      });
    } else {
      // Reset fields if no loan type is selected
      this.loanDetailsForm$.patchValue({
        amount: '',
        days: '',
      });
    }
  }
  async submitApplication() {
    if (this.accountInfoForm$.invalid || this.loanDetailsForm$.invalid) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    const formValues = this.accountInfoForm$.value;
    const loanValues = this.loanDetailsForm$.value;

    let users: Users = {
      id: generateRandomString(),
      firstName: formValues.firstName,
      middleName: formValues.middleName,
      lastName: formValues.lastName,
      profile: null,
      type: UserType.BORROWER,
      phone: formValues.phone,
      email: formValues.email,
      username: formValues.username,
      password: '00000',
      createdAt: new Date(),
    };

    let type = this.getLoanType(loanValues.type);

    let amount = type?.startingAmount ?? 0;
    let interest = type?.interest ?? 0;

    let loan: LoanAccount = {
      id: users.username,
      productLoanID: type?.id ?? '',
      creditScore: 100,
      amount: amount,
      createdAt: new Date(),
      updatedAt: new Date(),
      interest: interest,
      name: type?.name ?? '',
      payableDays: type?.payableDays ?? 0,
      status: LoanAccountStatus.PENDING,
      address: formValues.address,
    };

    this.isLoading = true;
    try {
      await this.authService.createBorrower(
        users,

        this.selectedFiles,
        loan
      );
      this.toastr.success('Successfully submitted');
      this.location.back();
    } catch (err: any) {
      this.toastr.error(err['message'] ?? 'Unknown error');
    } finally {
      this.isLoading = false;
    }
  }
  uploadSelected(file: File, type: number) {
    this.selectedFiles[type] = file;
  }
  getLoanType(id: string): ProductLoan | null {
    return this.loanTypes.find((type) => type.id === id) || null;
  }

  get payableDays(): string {
    const loanValues = this.loanDetailsForm$.value;
    const type = this.getLoanType(loanValues.type);
    const amount = loanValues.amount ?? 0;
    const interest = type?.interest ?? 0;
    const days = loanValues.days ?? 0;

    if (days === 0) {
      return 'Number of days is required to calculate daily payment.';
    }

    const totalWithInterest = amount + (amount * interest) / 100;
    const dailyPayment = totalWithInterest / days;

    return `Total amount: ${totalWithInterest.toFixed(
      2
    )}   Daily payment: ${dailyPayment.toFixed(2)}`;
  }
}
