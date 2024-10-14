import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { loanTypeConverter, LoanTypes } from '../models/loans/loan-types';
import { Observable } from 'rxjs';

export const LOAN_TYPE_COLLECTION = 'loan-types';
@Injectable({
  providedIn: 'root',
})
export class LoanTypeService {
  constructor(private firestore: Firestore) {}

  createLoanType(type: LoanTypes) {
    return setDoc(
      doc(this.firestore, LOAN_TYPE_COLLECTION, type.id).withConverter(
        loanTypeConverter
      ),
      type
    );
  }
  getAllLoanTypes(): Observable<LoanTypes[]> {
    const q = query(
      collection(this.firestore, LOAN_TYPE_COLLECTION).withConverter(
        loanTypeConverter
      ),
      orderBy('createdAt', 'desc'),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }

  updateLoanType(type: LoanTypes) {
    return updateDoc(
      doc(this.firestore, LOAN_TYPE_COLLECTION, type.id).withConverter(
        loanTypeConverter
      ),
      { ...type }
    );
  }
  deleteLoanType(id: string) {
    return deleteDoc(doc(this.firestore, LOAN_TYPE_COLLECTION, id));
  }
}
