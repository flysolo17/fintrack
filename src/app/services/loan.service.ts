import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { generateRandomNumber, processPayment } from '../utils/Constants';
import {
  identificationConverter,
  Identifications,
} from '../models/accounts/Identifications';
import { userConverter, Users } from '../models/accounts/users';

import { AUTH_COLLECTION, AuthService, LOAN_ACCOUNT } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { historyConverter, LoanHistory } from '../models/loans/loan-history';
import {
  loanConverter,
  Loans,
  LoanStatus,
  PaymentSchedule,
  PaymentStatus,
} from '../models/loans/loan';
import { LOAN_HISTORY_COLLECTION } from './history.service';
import { EncryptionService } from './encryption.service';
import {
  catchError,
  delay,
  forkJoin,
  from,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { LoanWithUser } from '../models/loans/LoanWithUser';
import { LoanWithBorrowerAndCollector } from '../models/loans/LoanWithUserAndCollector';
import {
  LoanAccount,
  loanAccountConverter,
} from '../models/accounts/LoanAccount';
import { LoanWithUserAndDocuments } from '../models/loans/LoanWithUserAndDocuments';
import { User } from '@angular/fire/auth';
export const IDENTIFICATION_COLLECTION = 'identifications';
export const LOANS_COLLECTION = 'loans';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  calculateLoan(loanAmount: number, interestRate: number, loanTerm: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService,
    private toastr: ToastrService,
    private encryptionService: EncryptionService
  ) {}

  getAllLoans(): Observable<Loans[]> {
    const q = query(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      orderBy('updatedAt', 'desc'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q);
  }
  acceptLoan(loan: Loans, history: LoanHistory, loanWithoutInterest: number) {
    const batch = writeBatch(this.firestore);
    const loanAccountRef = doc(
      collection(this.firestore, LOAN_ACCOUNT).withConverter(
        loanAccountConverter
      ),
      loan.loanAccountID
    );

    batch.update(loanAccountRef, {
      amount: increment(-loanWithoutInterest),
    });
    let loanRef = doc(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      loan.id
    );

    let historyRef = doc(
      collection(this.firestore, LOAN_HISTORY_COLLECTION).withConverter(
        historyConverter
      ),
      history.id
    );

    batch.set(historyRef, history);

    batch.set(loanRef, loan);

    return batch.commit();
  }

  updateLoan(loanID: string, status: LoanStatus, history: LoanHistory) {
    const batch = writeBatch(this.firestore);

    let loanRef = doc(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      loanID
    );

    let historyRef = doc(
      collection(this.firestore, LOAN_HISTORY_COLLECTION).withConverter(
        historyConverter
      ),
      history.id
    );

    batch.set(historyRef, history);

    batch.update(loanRef, {
      status: status,
      updatedAt: new Date(),
    });

    return batch.commit();
  }

  async viewLoanAccount(id: string): Promise<LoanWithUserAndDocuments> {
    const userRef = query(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      where('username', '==', id),
      limit(1)
    );

    const loanAccountRef = doc(this.firestore, LOAN_ACCOUNT, id).withConverter(
      loanAccountConverter
    );

    const documentsRef = doc(
      this.firestore,
      IDENTIFICATION_COLLECTION,
      id
    ).withConverter(identificationConverter);

    const userSnapshot = await getDocs(userRef);
    const user = !userSnapshot.empty
      ? (userSnapshot.docs[0].data() as Users)
      : null;

    const loanAccountSnapshot = await getDoc(loanAccountRef);
    const loanAccount = loanAccountSnapshot.exists()
      ? (loanAccountSnapshot.data() as LoanAccount)
      : null;

    const documentSnapshot = await getDoc(documentsRef);
    const document = documentSnapshot.exists()
      ? (documentSnapshot.data() as Identifications)
      : null;

    let data: LoanWithUserAndDocuments = {
      user: user,
      document: document,
      loanAccount: loanAccount,
    };
    return data;
  }
  getHistory(id: string): Observable<LoanHistory[]> {
    const historyQuery = query(
      collection(this.firestore, LOAN_HISTORY_COLLECTION).withConverter(
        historyConverter
      ),
      where('borrowerID', '==', id),
      orderBy('createdAt', 'desc')
    );
    return collectionData(historyQuery);
  }

  getActiveLoans(id: string): Observable<Loans[]> {
    const loanQuery = query(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      where('loanAccountID', '==', id),
      orderBy('updatedAt', 'desc'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(loanQuery);
  }

  getRecentLoans() {
    const loanQuery = query(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      orderBy('updatedAt', 'desc'),
      orderBy('createdAt', 'desc')
    );
    return collectionData(loanQuery).pipe(
      switchMap((loans: Loans[]) => {
        const loanWithUserObservables = loans.map((loan) => {
          const userQuery = query(
            collection(this.firestore, AUTH_COLLECTION).withConverter(
              userConverter
            ),
            where('username', '==', loan.loanAccountID),
            limit(1)
          );
          return from(getDocs(userQuery)).pipe(
            map((usersSnapshot) => ({
              loan,
              users:
                usersSnapshot.docs.length > 0
                  ? usersSnapshot.docs[0].data()
                  : null,
            }))
          );
        });
        return forkJoin(loanWithUserObservables);
      })
    );
  }
  getPaymentsWithUser(): Observable<LoanWithUser[]> {
    const loanQuery = query(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      where('status', '==', LoanStatus.CONFIRMED),
      orderBy('createdAt', 'desc')
    );

    return collectionData(loanQuery).pipe(
      switchMap((loans: Loans[]) => {
        const loanWithUserObservables = loans.map((loan) => {
          const userQuery = query(
            collection(this.firestore, AUTH_COLLECTION).withConverter(
              userConverter
            ),
            where('username', '==', loan.loanAccountID),
            limit(1)
          );
          return from(getDocs(userQuery)).pipe(
            map((usersSnapshot) => ({
              loan,
              users:
                usersSnapshot.docs.length > 0
                  ? usersSnapshot.docs[0].data()
                  : null,
            }))
          );
        });
        return forkJoin(loanWithUserObservables);
      })
    );
  }

  async updatePaymentStatusAndAmount(
    loanID: string,
    amount: number,
    history: LoanHistory
  ) {
    const batch = writeBatch(this.firestore);
    const loanRef = doc(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      loanID
    );
    const today = new Date();

    try {
      const loanDoc = await getDoc(loanRef);
      if (!loanDoc.exists()) {
        console.log(`Loan not found: ${loanID}`);
        return;
      }

      const loan = loanDoc.data();

      const updatedLoan = processPayment(loan, amount);
      batch.update(loanRef, updatedLoan);

      let overdueCount = loan.paymentSchedule.reduce((count, e) => {
        const scheduleDate = new Date(e.date);
        return (
          count +
          (e.status !== 'PAID' &&
          scheduleDate < today &&
          scheduleDate.getDate() !== today.getDate()
            ? 1
            : 0)
        );
      }, 0);

      if (overdueCount > 0) {
        const loanAccountRef = doc(
          this.firestore,
          LOAN_ACCOUNT,
          loan.loanAccountID
        );
        batch.update(loanAccountRef, {
          creditScore: increment(-overdueCount),
          updatedAt: new Date(),
        });
      }

      const historyRef = doc(
        collection(this.firestore, LOAN_HISTORY_COLLECTION).withConverter(
          historyConverter
        ),
        history.id
      );
      batch.set(historyRef, {
        ...history,
        createdAt: new Date(),
      });

      await batch.commit();

      console.log('Payments updated successfully.');
    } catch (error) {
      console.error('Error updating payment status and amount:', error);
    }
  }

  increaseLimit(loanAccountID: string, limit: number, history: LoanHistory) {
    const batch = writeBatch(this.firestore);
    const loanAcccountRef = doc(
      collection(this.firestore, LOAN_ACCOUNT).withConverter(
        loanAccountConverter
      ),
      loanAccountID
    );
    batch.update(loanAcccountRef, {
      amount: increment(limit),
      updatedAt: new Date(),
    });

    batch.set(
      doc(this.firestore, LOAN_HISTORY_COLLECTION, history.id),
      history
    );
    return batch.commit();
  }
}
