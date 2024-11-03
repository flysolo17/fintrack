import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Loans {
  id: string;
  borrowerID: string;
  collectorID: string;
  borrowerStatus: BorrowerStatus;
  amount: number;
  interest: number;
  loanTotal: number;
  loanType: string;
  status: LoanStatus;
  paymentDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export const loanConverter = {
  toFirestore: (data: Loans) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Loans;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};

export enum LoanStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  PAID = 'PAID',
}
export enum BorrowerStatus {
  OLD = 'OLD',
  NEW = 'NEW',
}
