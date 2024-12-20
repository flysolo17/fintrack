import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface ProductLoan {
  id: string;
  name: string;
  description: string;
  startingAmount: number;
  interest: number;
  payableDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export const loanTypeConverter = {
  toFirestore: (data: ProductLoan) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as ProductLoan;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
