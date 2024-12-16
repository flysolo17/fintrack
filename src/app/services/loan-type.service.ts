import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';

import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { loanTypeConverter, ProductLoan } from '../models/loans/loan-types';
import { ProductWithAvailed } from '../models/products/ProductWithAvailed';
import { LOAN_ACCOUNT } from './auth.service';
import { loanAccountConverter } from '../models/accounts/LoanAccount';

export const LOAN_TYPE_COLLECTION = 'product-loan';
@Injectable({
  providedIn: 'root',
})
export class LoanTypeService {
  constructor(private firestore: Firestore) {}

  getProductsAvailed(): Observable<ProductWithAvailed[]> {
    const q = query(
      collection(this.firestore, LOAN_TYPE_COLLECTION).withConverter(
        loanTypeConverter
      ),
      orderBy('createdAt', 'desc'),
      orderBy('updatedAt', 'desc')
    );

    return collectionData(q).pipe(
      switchMap((products) =>
        // Map over the products to fetch availed accounts
        forkJoin(
          products.map((product) => {
            const accountsQuery = query(
              collection(this.firestore, LOAN_ACCOUNT).withConverter(
                loanAccountConverter
              ),
              where('productLoanID', '==', product.id)
            );

            return getDocs(accountsQuery).then((snapshot) => ({
              id: product.id,
              name: product.name,
              availed: snapshot.size,
            }));
          })
        )
      )
    );
  }

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
