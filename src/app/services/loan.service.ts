import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
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

import { AUTH_COLLECTION, AuthService } from './auth.service';
import { ToastrService } from 'ngx-toastr';
import { historyConverter, LoanHistory } from '../models/loans/loan-history';
import { loanConverter, Loans, LoanStatus } from '../models/loans/loan';
import { LOAN_HISTORY_COLLECTION } from './history.service';
import { EncryptionService } from './encryption.service';
import {
  catchError,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { LoanWithUser } from '../models/loans/LoanWithUser';
import { LoanWithBorrowerAndCollector } from '../models/loans/LoanWithUserAndCollector';
export const IDENTIFICATION_COLLECTION = 'identifications';
export const LOANS_COLLECTION = 'loans';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private authService: AuthService,
    private toastr: ToastrService,
    private encryptionService: EncryptionService
  ) {}

  acceptLoan(loan: LoanWithBorrowerAndCollector) {
    const batch = writeBatch(this.firestore);
    let loanRef = doc(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      loan.loan?.id
    );

    let historyID = generateRandomNumber(12);
    let history: LoanHistory = {
      id: historyID,
      borrowerID: loan.borrower?.id ?? '',
      loanID: loan.loan?.id ?? '',
      message: `Congratulations ${loan.borrower?.firstName}! Your loan request for an amount of ${loan.loan?.amount} has been approved. We are excited to assist you with your financial needs!`,
      createdAt: new Date(),
    };

    let historyRef = doc(
      collection(this.firestore, LOAN_HISTORY_COLLECTION).withConverter(
        historyConverter
      ),
      historyID
    );

    batch.set(historyRef, history);

    batch.update(loanRef, {
      status: LoanStatus.CONFIRMED,
    });

    return batch.commit();
  }

  getAllLoans(uid: string): Observable<LoanWithUser[]> {
    const loanRef = collection(this.firestore, LOANS_COLLECTION).withConverter(
      loanConverter
    );
    const q = query(
      loanRef,
      where('collectorID', '==', uid),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q).pipe(
      switchMap((loans) =>
        from(
          Promise.all(
            loans.map(async (loan) => {
              const user = await this.authService.getUserData(loan.borrowerID);
              return { loan, users: user };
            })
          )
        )
      )
    );
  }

  getLoanWithBorrowerAndCollector(): Observable<
    LoanWithBorrowerAndCollector[]
  > {
    const loanRef = collection(this.firestore, LOANS_COLLECTION).withConverter(
      loanConverter
    );
    const q = query(loanRef, orderBy('createdAt', 'desc'));

    return collectionData(q).pipe(
      switchMap((loans) =>
        from(
          Promise.all(
            loans.map(async (loan) => {
              const borrower = await this.authService.getUserData(
                loan.borrowerID
              );
              const collector = await this.authService.getUserData(
                loan.collectorID
              );
              return { loan, collector: collector, borrower: borrower };
            })
          )
        )
      )
    );
  }

  async saveIdentifications(uid: string, files: any[]) {
    let identification: Identifications = {
      accountID: uid,
      first_id: null,
      secound_id: null,
      third_id: null,
      gov_id: null,
      cedula: null,
      omeco_bill: null,
      barangay_permit: null,
    };

    const uploadPromises = files.map(async (file, index) => {
      var downloadURL = null;
      if (file != null) {
        downloadURL = await this.uploadID(uid, file);
      }
      switch (index) {
        case 0:
          identification.first_id = downloadURL;
          break;
        case 1:
          identification.secound_id = downloadURL;
          break;
        case 2:
          identification.third_id = downloadURL;
          break;
        case 3:
          identification.gov_id = downloadURL;
          break;
        case 4:
          identification.barangay_permit = downloadURL;
          break;
        case 5:
          identification.cedula = downloadURL;
          break;
        case 6:
          identification.omeco_bill = downloadURL;
          break;
        default:
          console.warn(`Unexpected file index: ${index}`);
      }
    });

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    return identification;
  }

  async uploadID(uid: string, file: File) {
    try {
      const fireRef = ref(this.storage, `${uid}/${generateRandomNumber()}`);
      await uploadBytes(fireRef, file);
      const downloadURL = await getDownloadURL(fireRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async createLoan(users: Users, loan: Loans, identifications: any[]) {
    let isExist = await this.authService.checkUserIfExists(users.username);
    if (isExist) {
      this.toastr.error('User exists');
      return;
    }
    const encryptedPassword = this.encryptionService.encrypt(users.password);
    users.password = encryptedPassword;
    let batch = writeBatch(this.firestore);
    let identificationRef = doc(
      collection(this.firestore, IDENTIFICATION_COLLECTION).withConverter(
        identificationConverter
      ),
      users.id
    );
    let identification = await this.saveIdentifications(
      users.id,
      identifications
    );
    batch.set(identificationRef, identification);
    let userRef = doc(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      users.id
    );

    batch.set(userRef, users);
    let historyID = generateRandomNumber(12);
    let history: LoanHistory = {
      id: historyID,
      borrowerID: users.id,
      loanID: loan.id,
      message: `${users.username} requested a loan amount ${loan.amount}.`,
      createdAt: new Date(),
    };
    let historyRef = doc(
      collection(this.firestore, LOAN_HISTORY_COLLECTION).withConverter(
        historyConverter
      ),
      historyID
    );
    batch.set(historyRef, history);

    let loanRef = doc(
      collection(this.firestore, LOANS_COLLECTION).withConverter(loanConverter),
      loan.id
    );
    batch.set(loanRef, loan);

    return batch.commit();
  }
}
