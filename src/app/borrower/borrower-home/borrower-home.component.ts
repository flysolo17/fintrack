import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs/operators';
import { Router } from '@angular/router';
import { PaymentRow } from '../../loan/view-loan/view-loan.component';
import { Users } from '../../models/accounts/users';
import { Loans, PaymentStatus } from '../../models/loans/loan';
import {
  LoanHistory,
  LoanHistoryByMonth,
} from '../../models/loans/loan-history';
import { AuthService } from '../../services/auth.service';
import { HistoryService } from '../../services/history.service';
import { LoanService } from '../../services/loan.service';
import { PdfGenerationService } from '../../services/pdf-generation.service';

@Component({
  selector: 'app-borrower-home',
  templateUrl: './borrower-home.component.html',
  styleUrls: ['./borrower-home.component.css'],
})
export class BorrowerHomeComponent implements OnInit {
  histories$: Observable<LoanHistory[]> | undefined;
  activeLoans$: Observable<Loans[]> | undefined;
  payments: PaymentRow[] = [];
  users$: Users | null = null;
  active = 1;

  loanHistoryByMonth$: Observable<LoanHistoryByMonth[]> = of([]);
  searhText$ = new FormControl('');
  filteredPayments$: Observable<PaymentRow[]> = of([]);
loan: any;
totalCollected$: string | number | undefined;

  constructor(
    private loanService: LoanService,
    private router: Router,
    private authService: AuthService,
    private loanHistoryService: HistoryService,
    private pdfGenerator: PdfGenerationService
  ) {}

  createPdf(loan: Loans) {
    this.pdfGenerator.createPDF(loan);
  }

  ngOnInit(): void {
    let id = localStorage.getItem('uid') ?? '';
    this.loanHistoryByMonth$ =
      this.loanHistoryService.getPaidLoanHistoryByCollectorIDGroupByMonth(id);
    this.authService.getUserByID(id).subscribe((data: Users | null) => {
      this.users$ = data;
      if (this.users$ != null) {
        this.histories$ = this.loanService.getHistory(this.users$.username);
        this.activeLoans$ = this.loanService.getActiveLoans(
          this.users$.username
        );

        this.activeLoans$.subscribe((data: Loans[]) => {
          data.forEach((e) => {
            let schedules = e.paymentSchedule;
            schedules.forEach((s) => {
              this.payments.push({
                loanId: e.id,
                date: this.formatDate(s.date),
                amount: s.amount.toString(),
                status: s.status,
              });
            });
          });
          this.initializeSearch();
        });
      }
    });
  }

  initializeSearch(): void {
    this.filteredPayments$ = this.searhText$.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map((text) => this.filterPayments(text || ''))
    );
  }

  filterPayments(text: string): PaymentRow[] {
    return this.payments.filter(
      (payment) =>
        payment.loanId.toLowerCase().includes(text.toLowerCase()) ||
        payment.date.includes(text) ||
        payment.amount.includes(text) ||
        payment.status.toLowerCase().includes(text.toLowerCase())
    );
  }

  formatDate(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
      this.router.resetConfig(this.router.config);
    });
  }

  get unpaid(): number {
    return this.payments.filter((e) => e.status === PaymentStatus.UNPAID)
      .length;
  }

  get paid(): number {
    return this.payments.filter((e) => e.status === PaymentStatus.PAID).length;
  }

  get overdue(): number {
    return this.payments.filter((e) => e.status === PaymentStatus.OVERDUE)
      .length;
  }
}
