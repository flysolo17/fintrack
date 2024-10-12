import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-loan',
  templateUrl: './create-loan.component.html',
  styleUrl: './create-loan.component.css',
})
export class CreateLoanComponent implements OnInit {
  accountID: string | undefined;
  accountInfoForm$: FormGroup;

  loanDetailsForm$: FormGroup;
  constructor(private route: ActivatedRoute, private fb: FormBuilder) {
    this.accountInfoForm$ = fb.nonNullable.group({
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(11)]],
      username: ['', Validators.required],
    });

    this.loanDetailsForm$ = fb.nonNullable.group({
      amount: [1700, [Validators.required, Validators.min(1700)]],
      interest: [0, [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.accountID = params['account'];
      this.accountInfoForm$.controls['username'].setValue(this.accountID);
    });
  }

  submitAccountInfo() {}
  uploadSelected(file: File) {
    alert('Test');
  }
}
