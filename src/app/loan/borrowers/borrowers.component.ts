import { Component, inject, OnInit } from '@angular/core';
import { generateRandomNumber } from '../../utils/Constants';
import { Router } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanWithUser } from '../../models/loans/LoanWithUser';
import { AuthService } from '../../services/auth.service';
import { UserWithLoanAccount } from '../../models/accounts/UserWithLoanAccount';
import { Users } from '../../models/accounts/users';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MakeLoanComponent } from '../dialogs/make-loan/make-loan.component';

@Component({
  selector: 'app-borrowers',
  templateUrl: './borrowers.component.html',
  styleUrl: './borrowers.component.css',
})
export class BorrowersComponent implements OnInit {
data$: any;
viewLoanAccount(arg0: string) {
throw new Error('Method not implemented.');
}
  filteredLoans(): any {
    throw new Error('Method not implemented.');
  }
  approveLoan(arg0: any) {
    throw new Error('Method not implemented.');
  }
  modalService = inject(NgbModal);
  loans$: UserWithLoanAccount[] = [];
  loanStatus: any;
  user$: Users | null = null;
  loanService: any;
  toastr: any;
  searchQuery: any;
  constructor(private router: Router, private authService: AuthService) {}
  ngOnInit(): void {
    let uid = localStorage.getItem('uid') ?? '';
    this.authService.getUserData(uid).then((data) => {
      this.user$ = data;
    });
    this.authService.getUserWithLoanAccount().subscribe(
      (data) => {
        this.loans$ = data;
        console.log(data);
      },
      (error) => {
        console.error('Error fetching user with loan account:', error);
        // Handle the error (e.g., show a notification or set a flag)
      }
    );
  }
  createLoan() {
    const extras = {
      queryParams: {
        account: generateRandomNumber(),
      },
    };
    const user = this.user$?.type.toLocaleLowerCase();
    this.router.navigate([`${user}/create-loan`], extras);
  }

  makeAloan(id: string) {
    const user = this.user$?.type.toLocaleLowerCase();
    this.router.navigate([`${user}/borrowers/${id}`]);
  }
  declineLoan(loanId: string): void {
    if (!loanId) return;

    this.loanService.declineLoan(loanId).subscribe({
      next: (response: any) => {
        console.log('Declined loan:', response);
        this.toastr.success('Loan declined successfully', 'Success');
        this.refreshLoans(); // Refresh the loans list
      },
      error: (err: any) => {
        console.error('Error declining loan:', err);
        this.toastr.error('Failed to decline loan', 'Error');
      },
    });
  }

  viewLoan(loanId: string): void {
    if (!loanId) return;

    console.log('Navigating to view loan:', loanId);
    this.router.navigate(['/loans', loanId]); // Navigate to a detailed view page
  }

  refreshLoans(): void {
    this.loanService.getLoans().subscribe({
      next: (loans: UserWithLoanAccount[]) => {
        this.loans$ = loans;
      },
      error: (err: any) => {
        console.error('Error fetching loans:', err);
      },
    });
  }
}
const loans$ = [
  {
    loanAccount: {
      id: '12345',
      name: 'Personal',
      interest: 5,
      amount: 10000,
      status: 'Approved', // Add status
    },
    user: {
      firstName: 'John',
      lastName: 'Doe',
      profile: 'path-to-profile-image',
    },
  },
  {
    loanAccount: {
      id: '67890',
      name: 'Business',
      interest: 3,
      amount: 50000,
      status: 'Pending', // Add status
    },
    user: {
      firstName: 'Jane',
      lastName: 'Smith',
      profile: null, // Default profile will be used
    },
  },
];
export interface LoanAccount {
  id: string;
  name: string;
  interest: number;
  amount: number;
  status?: string; // Optional property
}
