import { LoanAccount } from '../models/accounts/LoanAccount';
import { Loans, PaymentStatus } from '../models/loans/loan';

export function generateRandomString(size: number = 12): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateRandomNumber(size: number = 15) {
  const characters = '0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// export function processPayment(loan: Loans, amount: number): Loans {
//   const today = new Date();
//   let remainingPayment = amount;
//   loan.paymentSchedule.forEach((schedule) => {
//     const scheduleDate = new Date(schedule.date);
//     if (
//       schedule.status !== 'PAID' &&
//       scheduleDate < today &&
//       scheduleDate.getDate() !== today.getDate()
//     ) {
//       schedule.status = PaymentStatus.OVERDUE;
//     }
//   });

//   const sortedSchedules = loan.paymentSchedule
//     .filter((schedule) => schedule.status !== PaymentStatus.PAID)
//     .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//   let totalPaid = 0;

//   for (const schedule of sortedSchedules) {
//     if (remainingPayment <= 0) break;
//     const paymentForThisSchedule = Math.min(schedule.amount, remainingPayment);
//     schedule.amount -= paymentForThisSchedule;
//     remainingPayment -= paymentForThisSchedule;
//     totalPaid += paymentForThisSchedule;

//     if (schedule.amount === 0) {
//       schedule.status = PaymentStatus.PAID;
//     }
//   }

//   loan.amountPaid += totalPaid;
//   loan.updatedAt = new Date();

//   return loan;
// }

export function processPayment(loan: Loans, amount: number): Loans {
  const today = new Date();
  let remainingPayment = amount;

  // Update schedule status to OVERDUE if applicable
  loan.paymentSchedule.forEach((schedule) => {
    const scheduleDate = new Date(schedule.date);
    if (
      schedule.status !== PaymentStatus.PAID &&
      scheduleDate < today &&
      scheduleDate.getDate() !== today.getDate()
    ) {
      schedule.status = PaymentStatus.OVERDUE;
    }
  });

  const sortedSchedules = loan.paymentSchedule
    .filter((schedule) => schedule.status !== PaymentStatus.PAID)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalPaid = 0;

  for (const schedule of sortedSchedules) {
    if (remainingPayment <= 0) break;

    const paymentForThisSchedule = Math.min(schedule.amount, remainingPayment);
    schedule.amount -= paymentForThisSchedule;
    remainingPayment -= paymentForThisSchedule;
    totalPaid += paymentForThisSchedule;

    if (schedule.amount === 0) {
      schedule.status = PaymentStatus.PAID;
    }
  }

  loan.amountPaid += totalPaid;
  loan.updatedAt = new Date();

  return loan;
}
