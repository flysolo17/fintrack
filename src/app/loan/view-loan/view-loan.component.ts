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
import { Loans, PaymentStatus } from '../../models/loans/loan';

export interface PaymentRow {
  date: string;
  amount: string;
  status: PaymentStatus;
}
@Component({
  selector: 'app-view-loan',
  templateUrl: './view-loan.component.html',
  styleUrl: './view-loan.component.css',
})
export class ViewLoanComponent implements OnInit {
  modalService = inject(NgbModal);
  active = 1;
  data$: LoanWithUserAndDocuments | null = null;
  yung_mga_images = this.data$?.document ?? [];
  yung_info_ng_user = this.data$?.user;
  yung_loan_account_ng_user = this.data$?.loanAccount;
  loading$: boolean = false;
  histories$: Observable<LoanHistory[]> | undefined;
  activeLoans$: Observable<Loans[]> | undefined;
  filteredPayments: PaymentRow[] = [];
  payments: PaymentRow[] = [];
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

        this.activeLoans$.subscribe((data: Loans[]) => {
          data.forEach((e) => {
            let schedules = e.paymentSchedule;
            schedules.forEach((s) => {
              this.payments.push({
                date: this.formatDate(s.date),
                amount: s.amount.toString(),
                status: s.status,
              });
            });
          });
        });
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

  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}
