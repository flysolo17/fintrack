import { Component } from '@angular/core';
import {
  generateRandomNumber,
  generateRandomString,
} from '../../utils/Constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-collector-home',
  templateUrl: './collector-home.component.html',
  styleUrl: './collector-home.component.css',
})
export class CollectorHomeComponent {
  constructor(private router: Router) {}
  get randomAccountNumber(): string {
    return generateRandomNumber();
  }

  createLoan() {
    const extras = {
      queryParams: {
        account: generateRandomNumber(),
      },
    };
    this.router.navigate(['collector/create-loan'], extras);
  }
}
