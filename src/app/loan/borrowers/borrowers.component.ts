import { Component, OnInit, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';
import { Users } from '../../models/accounts/users';
import { UserWithLoanAccount } from '../../models/accounts/UserWithLoanAccount';
import { AuthService } from '../../services/auth.service';
import { generateRandomNumber } from '../../utils/Constants';

@Component({
  selector: 'app-borrowers',
  templateUrl: './borrowers.component.html',
  styleUrls: ['./borrowers.component.css'],
})
export class BorrowersComponent implements OnInit {
  deleteLoanAccount(arg0: string) {
    throw new Error('Method not implemented.');
  }
  modalService = inject(NgbModal);
  loans$: UserWithLoanAccount[] = [];
  filteredLoans$: UserWithLoanAccount[] = [];
  searchTerm: string = '';
  loanStatus: any;
  user$: Users | null = null;
  loanService: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    let uid = localStorage.getItem('uid') ?? '';
    this.authService.getUserData(uid).then((data) => {
      this.user$ = data;
    });
    this.authService.getUserWithLoanAccount().subscribe(
      (data) => {
        this.loans$ = data;
        this.filteredLoans$ = data; // Initialize filtered loans
      },
      (error) => {
        console.error('Error fetching user with loan account:', error);
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

  declineLoanAccount(loanAccountID: string): void {
    this.authService
      .defaultLoanAccount(loanAccountID)
      .then(() => {
        this.toastr.success('Loan account is declined!');
      })
      .catch((err) => {
        this.toastr.error(err['message']);
      });
  }

  viewLoan(loanId: string): void {
    if (!loanId) return;

    console.log('Navigating to view loan:', loanId);
    this.router.navigate(['/loans', loanId]);
  }

  refreshLoans(): void {
    this.loanService.getLoans().subscribe({
      next: (loans: UserWithLoanAccount[]) => {
        this.loans$ = loans;
        this.filteredLoans$ = loans;
      },
      error: (err: any) => {
        console.error('Error fetching loans:', err);
      },
    });
  }

  acceptLoanAccount(loanAccountID: string) {
    this.authService
      .acceptLoanAccount(loanAccountID)
      .then(() => {
        this.toastr.success('Loan account is accepted!');
      })
      .catch((err) => {
        this.toastr.error(err['message']);
      });
  }

  filterLoans(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredLoans$ = this.loans$.filter((loan) =>
      `${loan.user?.firstName} ${loan.user?.lastName}`
        .toLowerCase()
        .includes(term)
    );
  }
}
