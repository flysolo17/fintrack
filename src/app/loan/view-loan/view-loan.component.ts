import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { LoanService } from '../../services/loan.service';
import { LoanWithUserAndDocuments } from '../../models/loans/LoanWithUserAndDocuments';
import { LoanAccount } from '../../models/accounts/LoanAccount';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MakeLoanComponent } from '../dialogs/make-loan/make-loan.component';
import { Users, UserType } from '../../models/accounts/users';
import { Observable } from 'rxjs';
import { LoanHistory } from '../../models/loans/loan-history';
import { Loans, LoanStatus, PaymentStatus } from '../../models/loans/loan';
import { PdfGenerationService } from '../../services/pdf-generation.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { IncreateLimitComponent } from '../dialogs/increate-limit/increate-limit.component';

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
  loading$: boolean = false;
  histories$: Observable<LoanHistory[]> | undefined;
  activeLoans$: Loans[] = [];
  filteredPayments: PaymentRow[] = [];
  payments: PaymentRow[] = [];
  user$: Users | null = null;
  loans$: Loans[] = [];

  constructor(
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private loanService: LoanService,
    private pdfGenerator: PdfGenerationService,
    private toastr: ToastrService
  ) {}

  createPdf(loan: Loans) {
    this.pdfGenerator.createPDF(loan);
  }
  increaseLimit(account: LoanAccount | null, admin: Users | null) {
    if (admin === null || admin.type !== UserType.ADMIN) {
      this.toastr.error('Invalid user');
      return;
    }
    const modal = this.modalService.open(IncreateLimitComponent);
    modal.componentInstance.account = account;
    modal.componentInstance.admin = account;
  }
  ngOnInit(): void {
    this.user$ = this.auth.users$;
    this.activatedRoute.paramMap.subscribe((params) => {
      let id = params.get('id');
      if (id !== null) {
        this.loading$ = true;
        this.histories$ = this.loanService.getHistory(id);

        this.loanService.getActiveLoans(id).subscribe((data: Loans[]) => {
          this.loans$ = data;
          this.activeLoans$ = [];
          data.forEach((e) => {
            if (
              e.status === LoanStatus.CONFIRMED ||
              e.status === LoanStatus.PENDING
            ) {
              this.payments = [];
              this.activeLoans$.push(e);
              let schedules = e.paymentSchedule;
              schedules.forEach((s) => {
                this.payments.push({
                  date: this.formatDate(s.date),
                  amount: s.amount.toString(),
                  status: s.status,
                });
              });
            }
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
