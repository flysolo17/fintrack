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

import { Observable } from 'rxjs';
import { loanTypeConverter, ProductLoan } from '../models/loans/loan-types';

export const LOAN_TYPE_COLLECTION = 'product-loan';
@Injectable({
  providedIn: 'root',
})
export class LoanTypeService {
  constructor(private firestore: Firestore) {}

  createLoanType(type: ProductLoan) {
    return setDoc(
      doc(this.firestore, LOAN_TYPE_COLLECTION, type.id).withConverter(
        loanTypeConverter
      ),
      type
    );
  }
  getAllLoanTypes(): Observable<ProductLoan[]> {
    const q = query(
      collection(this.firestore, LOAN_TYPE_COLLECTION).withConverter(
        loanTypeConverter
      ),
      orderBy('createdAt', 'desc'),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }

  updateLoanType(type: ProductLoan) {
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
