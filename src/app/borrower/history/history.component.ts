import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HistoryService } from '../../services/history.service';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { LoanHistory } from '../../models/loans/loan-history';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
  searchText$ = new FormControl('');
  history$: Observable<LoanHistory[]> = of([]);
  filteredHistory$: Observable<LoanHistory[]> = of([]);
  constructor(private historyService: HistoryService) {}
  ngOnInit(): void {
    const borrowerID = localStorage.getItem('uid') ?? '';

    // Fetch loan history
    this.history$ = this.historyService.getLoanHistoryByBorrowerID(borrowerID);

    // Filter the history based on searchText
    this.filteredHistory$ = combineLatest([
      this.history$,
      this.searchText$.valueChanges.pipe(startWith('')), // Start with an empty string
    ]).pipe(
      map(([history, searchText]) =>
        history.filter((item) => this.matchesSearchText(item, searchText ?? ''))
      )
    );
  }

  private matchesSearchText(item: LoanHistory, searchText: string): boolean {
    const lowerSearchText = searchText.toLowerCase();
    return (
      item.id.toLowerCase().includes(lowerSearchText) ||
      item.borrowerID.toLowerCase().includes(lowerSearchText) ||
      item.collectorID.toLowerCase().includes(lowerSearchText) ||
      item.loanID.toLowerCase().includes(lowerSearchText) ||
      item.message.toLowerCase().includes(lowerSearchText) ||
      item.amount.toString().includes(lowerSearchText) ||
      item.status.toLowerCase().includes(lowerSearchText) ||
      item.createdAt.toLocaleDateString().includes(lowerSearchText)
    );
  }
}
