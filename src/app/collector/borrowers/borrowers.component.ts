import { Component, OnInit } from '@angular/core';
import { generateRandomNumber } from '../../utils/Constants';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanWithUser } from '../../models/loans/LoanWithUser';

@Component({
  selector: 'app-borrowers',
  templateUrl: './borrowers.component.html',
  styleUrl: './borrowers.component.css',
})
export class BorrowersComponent implements OnInit {
  loans$: LoanWithUser[] = [];
  loanStatus: any;
  constructor(private router: Router, private loanService: LoanService) {}
  ngOnInit(): void {
    let uid = localStorage.getItem('uid') ?? '';
    console.log(uid);
    this.loanService.getAllLoans(uid).subscribe({
      next: (data) => {
        this.loans$ = data;
        console.log('Loans received:', data);
      },
      error: (err) => {
        console.error('Error fetching loans:', err);
      },
    });
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
