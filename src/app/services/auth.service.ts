import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { userConverter, Users, UserType } from '../models/accounts/users';
import { EncryptionService } from './encryption.service';
import { generateRandomNumber, generateRandomString } from '../utils/Constants';
import { user, User } from '@angular/fire/auth';
import {
  combineLatest,
  from,
  map,
  mergeMap,
  Observable,
  switchMap,
  toArray,
} from 'rxjs';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import {
  identificationConverter,
  Identifications,
} from '../models/accounts/Identifications';
import { ToastrService } from 'ngx-toastr';
import { IDENTIFICATION_COLLECTION } from './loan.service';
import {
  LoanAccount,
  loanAccountConverter,
  LoanAccountStatus,
} from '../models/accounts/LoanAccount';
import { UserWithLoanAccount } from '../models/accounts/UserWithLoanAccount';
export const AUTH_COLLECTION = 'users';
export const LOAN_ACCOUNT = 'loan-account';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  users$: Users | null = null;
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private encriptionService: EncryptionService,
    private toastr: ToastrService
  ) {}
  setUser(user: Users | null) {
    this.users$ = user;
  }

  async login(username: string, password: string): Promise<Users | null> {
    const q = query(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      where('username', '==', username),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }
    const userDoc = snapshot.docs[0];
    const user = userDoc.data() as Users;
    const decryptedPassword = this.encriptionService.decrypt(user.password);

    if (decryptedPassword === password) {
      localStorage.setItem('uid', user.id);
      return user;
    } else {
      return null;
    }
  }

  async checkUserIfExists(username: string): Promise<boolean> {
    try {
      const q = query(
        collection(this.firestore, AUTH_COLLECTION).withConverter(
          userConverter
        ),
        where('username', '==', username),
        limit(1)
      );

      const results = await getDocs(q);

      return !results.empty;
    } catch (err) {
      console.error('Error checking if user exists:', err);
      return false;
    }
  }

  async createCollector(user: Users, file: File) {
    try {
      const encryptedPassword = this.encriptionService.encrypt(user.password);
      user.password = encryptedPassword;
      const profileUrl = await this.uploadFile(file);
      user.profile = profileUrl;

      await setDoc(
        doc(this.firestore, AUTH_COLLECTION, user.id).withConverter(
          userConverter
        ),
        user
      );

      return user;
    } catch (error) {
      console.error('Error creating collector:', error);
      throw error;
    }
  }

  async uploadFile(file: File) {
    try {
      const fireRef = ref(
        this.storage,
        `${AUTH_COLLECTION}/${generateRandomString(19)}`
      );
      await uploadBytes(fireRef, file);
      const downloadURL = await getDownloadURL(fireRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  getAllCollectors(): Observable<Users[]> {
    const q = query(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      where('type', '==', UserType.COLLECTOR),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q);
  }

  getUserByID(uid: string): Observable<Users | null> {
    const docRef = doc(this.firestore, AUTH_COLLECTION, uid).withConverter(
      userConverter
    );
    return docData(docRef) as Observable<Users | null>;
  }

  async getUserData(uid: string): Promise<Users | null> {
    try {
      const docRef = doc(
        collection(this.firestore, AUTH_COLLECTION).withConverter(
          userConverter
        ),
        uid
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Users;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user data: ', error);
      return null;
    }
  }

  deleteCollector(uid: string) {
    return deleteDoc(doc(this.firestore, AUTH_COLLECTION, uid));
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

  async createBorrower(
    users: Users,
    identifications: any[],
    loanAccount: LoanAccount
  ) {
    let isExist = await this.checkUserIfExists(users.username);
    if (isExist) {
      this.toastr.error('User exists');
      return;
    }

    const encryptedPassword = this.encriptionService.encrypt(users.password);
    users.password = encryptedPassword;
    let batch = writeBatch(this.firestore);
    let loanAccountRef = doc(
      collection(this.firestore, LOAN_ACCOUNT).withConverter(
        loanAccountConverter
      ),
      loanAccount.id
    );
    batch.set(loanAccountRef, loanAccount);

    let identificationRef = doc(
      collection(this.firestore, IDENTIFICATION_COLLECTION).withConverter(
        identificationConverter
      ),
      users.username
    );
    let identification = await this.saveIdentifications(
      users.username,
      identifications
    );
    batch.set(identificationRef, identification);
    let userRef = doc(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      users.id
    );

    batch.set(userRef, users);
    return batch.commit();
  }

  getUserWithLoanAccount(): Observable<UserWithLoanAccount[]> {
    const loanAccounts = query(
      collection(this.firestore, LOAN_ACCOUNT).withConverter(
        loanAccountConverter
      ),
      orderBy('createdAt', 'desc'),
      orderBy('updatedAt', 'desc')
    );

    const loanAccountSnapshots = collectionData(loanAccounts, {
      idField: 'id',
    }).pipe(
      switchMap((loanAccounts) => {
        return from(loanAccounts).pipe(
          mergeMap(async (loanAccount) => {
            const userDoc = query(
              collection(this.firestore, AUTH_COLLECTION).withConverter(
                userConverter
              ),
              where('username', '==', loanAccount.id),
              limit(1)
            );

            const userSnapshot = await getDocs(userDoc);
            const user = !userSnapshot.empty
              ? (userSnapshot.docs[0].data() as Users)
              : null;
            return { user, loanAccount };
          }),
          toArray()
        );
      })
    );
    return loanAccountSnapshots;
  }

  deleteAll() {
    const data = collection(this.firestore, AUTH_COLLECTION);
    const q = query(data, where('username', '!=', 'fintrackadmin')); // Query to exclude "fintrackadmin"

    getDocs(q).then((snapshot) => {
      snapshot.forEach((docSnap) => {
        deleteDoc(doc(this.firestore, `${AUTH_COLLECTION}/${docSnap.id}`))
          .then(() => console.log(`Deleted document with id: ${docSnap.id}`))
          .catch((error) => console.error('Error deleting document: ', error));
      });
    });
  }

  acceptLoanAccount(loanAccountID: string) {
    return updateDoc(
      doc(this.firestore, LOAN_ACCOUNT, loanAccountID).withConverter(
        loanAccountConverter
      ),
      {
        status: LoanAccountStatus.ACCEPTED,
        updatedAt: new Date(),
      }
    );
  }

  declineLoanAccount(loanAccountID: string) {
    return updateDoc(
      doc(this.firestore, LOAN_ACCOUNT, loanAccountID).withConverter(
        loanAccountConverter
      ),
      {
        status: LoanAccountStatus.DECLINED,
        updatedAt: new Date(),
      }
    );
  }

  closeLoanAccount(loanAccountID: string) {
    return updateDoc(
      doc(this.firestore, LOAN_ACCOUNT, loanAccountID).withConverter(
        loanAccountConverter
      ),
      {
        status: LoanAccountStatus.CLOSED,
        updatedAt: new Date(),
      }
    );
  }

  defaultLoanAccount(loanAccountID: string) {
    return updateDoc(
      doc(this.firestore, LOAN_ACCOUNT, loanAccountID).withConverter(
        loanAccountConverter
      ),
      {
        status: LoanAccountStatus.DEFAULTED,
        updatedAt: new Date(),
      }
    );
  }

  cancelLoanAccount(loanAccountID: string) {
    return updateDoc(
      doc(this.firestore, LOAN_ACCOUNT, loanAccountID).withConverter(
        loanAccountConverter
      ),
      {
        status: LoanAccountStatus.CANCELLED,
        updatedAt: new Date(),
      }
    );
  }

  // Revert loan status back to pending (if applicable)
  revertLoanToPending(loanAccountID: string) {
    return updateDoc(
      doc(this.firestore, LOAN_ACCOUNT, loanAccountID).withConverter(
        loanAccountConverter
      ),
      {
        status: LoanAccountStatus.PENDING,
        updatedAt: new Date(),
      }
    );
  }
}
