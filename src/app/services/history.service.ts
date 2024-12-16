import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  Firestore,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { AUTH_COLLECTION } from './auth.service';
import { userConverter, UserType } from '../models/accounts/users';
import { combineLatest, from, map, Observable, switchMap } from 'rxjs';
import { LOANS_COLLECTION } from './loan.service';
import { loanConverter, LoanStatus } from '../models/loans/loan';
import { historyConverter } from '../models/loans/loan-history';
import { CollectorWithData } from '../models/accounts/CollectorWithData';

export const LOAN_HISTORY_COLLECTION = 'loan-history';
@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(private firestore: Firestore) {}

  getTopCollectors(): Observable<CollectorWithData[]> {
    const collectorsQuery = query(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      where('type', '==', UserType.COLLECTOR)
    );

    return collectionData(collectorsQuery).pipe(
      map((collectors) =>
        collectors.map((collector) =>
          combineLatest([
            this.getLoanPurchasesTotal(collector.id),
            this.getTotalAmountCollected(collector.id),
          ]).pipe(
            map(([loanPurchases, totalCollected]) => ({
              id: collector.id ?? '',
              profile: collector.profile ?? '',
              name: `${collector.firstName} ${collector.middleName} ${collector.lastName}`,
              totalAmountCollected: totalCollected,
              totalAmountLoanPurchases: loanPurchases,
            }))
          )
        )
      ),
      switchMap((collectorObservables) => combineLatest(collectorObservables))
    );
  }

  private getLoanPurchasesTotal(uid: string): Observable<number> {
    const loanPurchasesQuery = query(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      where('collectorID', '==', uid),
      where('status', '!=', LoanStatus.DECLINED)
    );

    return from(getDocs(loanPurchasesQuery)).pipe(
      map((snapshot) =>
        snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)
      )
    );
  }

  private getTotalAmountCollected(uid: string): Observable<number> {
    const totalCollectedQuery = query(
      collection(this.firestore, LOAN_HISTORY_COLLECTION).withConverter(
        historyConverter
      ),
      where('collectorID', '==', uid)
    );

    return from(getDocs(totalCollectedQuery)).pipe(
      map((snapshot) =>
        snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)
      )
    );
  }
}
