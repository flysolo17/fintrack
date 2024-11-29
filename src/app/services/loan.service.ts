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
  where,
  writeBatch,
} from '@angular/fire/firestore';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { generateRandomNumber } from '../utils/Constants';
import {
  identificationConverter,
  Identifications,
} from '../models/accounts/Identifications';
import { userConverter, Users } from '../models/accounts/users';

import { AUTH_COLLECTION, AuthService, LOAN_ACCOUNT } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { historyConverter, LoanHistory } from '../models/loans/loan-history';
import { loanConverter, Loans, LoanStatus } from '../models/loans/loan';
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
      where('status', '==', LoanStatus.CONFIRMED),
      orderBy('createdAt', 'desc')
    );
    return collectionData(loanQuery);
  }
}
