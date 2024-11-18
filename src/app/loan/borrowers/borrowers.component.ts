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
  modalService = inject(NgbModal);
  loans$: UserWithLoanAccount[] = [];
  loanStatus: any;
  user$: Users | null = null;
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
}
