import { LoanAccount } from '../accounts/LoanAccount';
import { Users } from '../accounts/users';
import { Loans } from './loan';

export interface LoanWithUser {
  users: Users | null;
  loan: Loans | null;
  loanAccount: LoanAccount | null;
}
