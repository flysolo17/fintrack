import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface LoanAccount {
  id: string;
  productLoanID: string;
  name: string;
  amount: number;
  interest: number;
  creditScore: number;
  payableDays: number;
  createdAt: Date;
  updatedAt: Date;
}
export const loanAccountConverter = {
  toFirestore: (data: LoanAccount) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as LoanAccount;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
