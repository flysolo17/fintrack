import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Users, UserType } from '../../models/accounts/users';
import { AuthService } from '../../services/auth.service';
import { LoanTypeService } from '../../services/loan-type.service';
import { BorrowerStatus, Loans, LoanStatus } from '../../models/loans/loan';
import { LoanService } from '../../services/loan.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { LoanTypes } from '../../models/loans/loan-types';
import {
  generateRandomNumber,
  generateRandomString,
} from '../../utils/Constants';

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
  loanTypes: LoanTypes[] = [];
  isLoading = false;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private loantypeService: LoanTypeService,
    private loanService: LoanService,
    private toastr: ToastrService,
    private location: Location
  ) {
    this.collector$ = authService.users$;
    this.accountInfoForm$ = fb.nonNullable.group({
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(11)]],
      username: ['', Validators.required],
    });

    this.loanDetailsForm$ = fb.nonNullable.group({
      amount: [
        1700,
        [Validators.required, Validators.min(1700), Validators.max(2000)],
      ],
      type: [null, [Validators.required]],
      days: [40, [Validators.required, Validators.min(40), Validators.max(60)]],
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
      type: UserType.ADMIN,
      phone: formValues.phone,
      email: formValues.email,
      username: formValues.username,
      password: '00000',
      createdAt: new Date(),
    };

    let type = this.getLoanType(loanValues.type);

    let amount = loanValues.amount ?? 0;
    let interest = type?.interest ?? 0;

    const totalWithInterest = amount + (amount * interest) / 100;
    let loan: Loans = {
      id: generateRandomNumber(13),
      borrowerID: users.id,
      amount: loanValues.amount,
      interest: type?.interest ?? 0,
      loanTotal: totalWithInterest,
      loanType: type?.name ?? 'No Loan Type',
      status: LoanStatus.PENDING,
      paymentDays: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      borrowerStatus: BorrowerStatus.NEW,
      collectorID: localStorage.getItem('uid') ?? '',
    };

    this.isLoading = true;
    try {
      await this.loanService.createLoan(users, loan, this.selectedFiles);
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
  getLoanType(id: string): LoanTypes | null {
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
