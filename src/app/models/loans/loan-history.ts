import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { PaymentStatus } from './loan';

export interface LoanHistory {
  id: string;
  borrowerID: string;
  collectorID: string;
  loanID: string;
  message: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
}
export const historyConverter = {
  toFirestore: (data: LoanHistory) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as LoanHistory;
    data.createdAt = (data.createdAt as any).toDate();
    return data;
  },
};
