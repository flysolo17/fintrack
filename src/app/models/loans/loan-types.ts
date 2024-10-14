import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface LoanTypes {
  id: string;
  name: string;
  description: string;
  discount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const loanTypeConverter = {
  toFirestore: (data: LoanTypes) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as LoanTypes;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
