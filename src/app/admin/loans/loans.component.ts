import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../services/loan.service';
import { Users } from '../../models/accounts/users';
import { FormControl } from '@angular/forms';
import { LoanWithUser } from '../../models/loans/LoanWithUser';
import { LoanHistory } from '../../models/loans/loan-history';
import { AuthService } from '../../services/auth.service';
import { generateRandomNumber } from '../../utils/Constants';
import { LoanStatus } from '../../models/loans/loan';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-loans',
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css',
})
export class LoansComponent implements OnInit {
  loans: LoanWithUser[] = [];
  filteredLoans: LoanWithUser[] = [];
  loans$ = this.loanService.getRecentLoans();
  searchText: FormControl = new FormControl('');
  currentPage: number = 1;
  pageSize: number = 20;

  user$: Users | null = null;
  constructor(
    private loanService: LoanService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.user$ = authService.users$;
  }

  ngOnInit(): void {
    // Subscribe to loans and filter based on search text
    this.loanService.getRecentLoans().subscribe((loans) => {
      this.loans = loans;
      this.filteredLoans = loans;
    });

    // Listen to search text changes
    this.searchText.valueChanges.subscribe((searchTerm) => {
      this.filterLoans(searchTerm);
    });
  }

  // Filter loans based on search term
  filterLoans(searchTerm: string): void {
    this.filteredLoans = this.loans.filter((loan) => {
      // Check for the existence of users and combine their name fields
      const name = loan.users
        ? `${loan.users.firstName} ${loan.users.middleName} ${loan.users.lastName}`
        : '';

      // Return true if the search term matches name or loan id
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loan?.id.toString().includes(searchTerm)
      );
    });
    this.currentPage = 1; // Reset to first page when search is updated
  }

  // Format name as "Lastname, Firstname M."
  formatName(user: Users | null): string {
    if (user == null) {
      return 'unknown user';
    }
    const fullName = `${user?.lastName}, ${
      user?.firstName
    } ${user?.firstName.charAt(0)}.`;
    return fullName;
  }

  // Get the loans for the current page
  getPaginatedLoans(): LoanWithUser[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredLoans.slice(startIndex, startIndex + this.pageSize);
  }

  // Handle page change
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  confirmLoan(loanWithUser: LoanWithUser) {
    let history: LoanHistory = {
      id: generateRandomNumber(10),
      borrowerID: loanWithUser.users?.id ?? '',
      collectorID: this.user$?.id ?? '',
      loanID: loanWithUser.loan?.id ?? '',
      message: 'Your loan has been accepted. Congratiolations',
      amount: loanWithUser.loan?.amount ?? 0,
      createdAt: new Date(),
    };

    this.loanService
      .updateLoan(loanWithUser.loan?.id ?? '', LoanStatus.CONFIRMED, history)
      .then((data) => {
        this.toastr.success('Loan Confirmed');
      })
      .catch((e) => {
        this.toastr.error(e['message']);
      });
  }

  decline(loanWithuser: LoanWithUser) {
    const history: LoanHistory = {
      id: generateRandomNumber(10),
      borrowerID: loanWithuser.users?.id ?? '',
      collectorID: this.user$?.id ?? '',
      loanID: loanWithuser.loan?.id ?? '',
      message: 'Your loan application has been declined.',
      amount: 0,
      createdAt: new Date(),
    };

    this.loanService
      .updateLoan(loanWithuser.loan?.id ?? '', LoanStatus.DECLINED, history)
      .then(() => {
        this.toastr.success('Loan Declined');
      })
      .catch((e) => {
        this.toastr.error(e['message']);
      });
  }

  markAsPaid(loanWithUser: LoanWithUser) {
    const history: LoanHistory = {
      id: generateRandomNumber(10),
      borrowerID: loanWithUser.users?.id ?? '',
      collectorID: this.user$?.id ?? '',
      loanID: loanWithUser.loan?.id ?? '',
      message: 'Your loan application has been completed. Congrats!',
      amount: 0,
      createdAt: new Date(),
    };

    this.loanService
      .updateLoan(loanWithUser.loan?.id ?? '', LoanStatus.PAID, history)
      .then(() => {
        this.toastr.success('Loan Completed');
      })
      .catch((e) => {
        this.toastr.error(e['message']);
      });
  }
}
