import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Loans {
  id: string;
  loanAccountID: string;
  amount: number;
  interest: number;
  amountPaid: number;
  paymentSchedule: PaymentSchedule[];
  status: LoanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSchedule {
  days: number;
  amount: number;
  date: Date;
  status: PaymentStatus;
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export const loanConverter = {
  toFirestore: (data: Loans) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Loans;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    data.paymentSchedule.forEach((e) => {
      e.date = (e.date as any).toDate();
    });
    return data;
  },
};

export enum LoanStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  PAID = 'PAID',
}

// export function createPaymentSchedule(days: number, startingDate: Date, payment: number): {
//   startingDate: Date;
//   endDate: Date;
// } {
//   const startingDate = new Date();
//   startingDate.setDate(startingDate.getDate() + 1);

//   const endDate = new Date(startingDate);
//   endDate.setDate(startingDate.getDate() + days);
//   return { startingDate, endDate };
// }
