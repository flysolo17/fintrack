import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanWithUserAndDocuments } from '../../models/loans/LoanWithUserAndDocuments';
import { LoanAccount } from '../../models/accounts/LoanAccount';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MakeLoanComponent } from '../dialogs/make-loan/make-loan.component';
import { Users } from '../../models/accounts/users';
import { Observable } from 'rxjs';
import { LoanHistory } from '../../models/loans/loan-history';
import { Loans } from '../../models/loans/loan';

@Component({
  selector: 'app-view-loan',
  templateUrl: './view-loan.component.html',
  styleUrl: './view-loan.component.css',
})
export class ViewLoanComponent implements OnInit {
  modalService = inject(NgbModal);
  data$: LoanWithUserAndDocuments | null = null;
  loading$: boolean = false;
  histories$: Observable<LoanHistory[]> | undefined;
  activeLoans$: Observable<Loans[]> | undefined;
  constructor(
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private loanService: LoanService
  ) {}
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      let id = params.get('id');
      if (id !== null) {
        this.loading$ = true;
        this.histories$ = this.loanService.getHistory(id);
        this.activeLoans$ = this.loanService.getActiveLoans(id);
        this.histories$.subscribe((data) => console.log('history', data));
        this.activeLoans$.subscribe((data) => console.log('Loans', data));
        this.viewLoan(id);
      }
    });
  }

  viewLoan(id: string) {
    this.loanService
      .viewLoanAccount(id)
      .then((data) => {
        this.data$ = data;
        console.log(data);
      })
      .finally(() => (this.loading$ = false));
  }

  createLoan(user: Users, loanAccount: LoanAccount) {
    const modal = this.modalService.open(MakeLoanComponent);
    modal.componentInstance.user = user;
    modal.componentInstance.loanAccount = loanAccount;
  }
}
