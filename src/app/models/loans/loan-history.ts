import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface LoanHistory {
  id: String;
  borrowerID: string;
  loanID: string;
  message: string;
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
