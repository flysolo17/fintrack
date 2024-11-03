import { Component } from '@angular/core';
import {
  generateRandomNumber,
  generateRandomString,
} from '../../utils/Constants';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-collector-home',
  templateUrl: './collector-home.component.html',
  styleUrl: './collector-home.component.css',
})
export class CollectorHomeComponent {
  get randomAccountNumber(): string {
    return generateRandomNumber();
  }

  constructor(private loanService: LoanService, private router: Router) {}

  createLoan() {
    const extras = {
      queryParams: {
        account: generateRandomNumber(),
      },
    };
    this.router.navigate(['collector/create-loan'], extras);
  }
}
