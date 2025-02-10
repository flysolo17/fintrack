import { LoanAccount } from '../models/accounts/LoanAccount';
import { Loans, PaymentStatus } from '../models/loans/loan';
import { LoanHistory } from '../models/loans/loan-history';

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

export function formatPhoneNumber(phone: string): string {
  if (phone.startsWith('0')) {
    return '+63' + phone.substring(1); // Replace '0' with '+63'
  }
  return phone; // Return the original phone number if it doesn't start with '0'
}

export function getStartTime(date: Date): Date {
  if (!date) {
    throw new Error('Invalid date');
  }
  const startTime = new Date(date);
  startTime.setHours(0, 0, 0, 0); // Set time to midnight
  return startTime;
}

export function getEndTime(date: Date): Date {
  if (!date) {
    throw new Error('Invalid date');
  }
  const endTime = new Date(date);
  endTime.setHours(23, 59, 59, 999); // Set time to just before midnight
  return endTime;
}

export function computeTotalCollected(history: LoanHistory[]): number {
  let total = 0;
  history.forEach((e) => (total += e.amount));
  return total;
}

export function getDailyPayableAmountWithoutInterest(
  loanID: string,
  loans: Loans[]
): number {
  const loan = loans.find((l) => l.id === loanID);
  if (loan && loan.paymentSchedule?.length > 0) {
    const interestAmount = (loan.amount * loan.interest) / 100;
    const principalAmount = loan.amount - interestAmount;
    const dailyPayableAmountWithoutInterest =
      principalAmount / loan.paymentSchedule.length;
    return dailyPayableAmountWithoutInterest;
  } else {
    return 0;
  }
}

export function collectedAmountPerDay(loanHistory: LoanHistory[]): number {
  let total = 0;
  loanHistory.forEach((e) => {
    if (e.status !== PaymentStatus.UNPAID) {
      total += e.amount;
    }
  });
  return total;
}
