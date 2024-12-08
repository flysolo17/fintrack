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
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-borrowers',
  templateUrl: './borrowers.component.html',
  styleUrl: './borrowers.component.css',
})
export class BorrowersComponent implements OnInit {
  data$: any;

  modalService = inject(NgbModal);
  loans$: UserWithLoanAccount[] = [];
  loanStatus: any;
  user$: Users | null = null;
  loanService: any;

  searchQuery: any;
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
        console.log(data);
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
}
