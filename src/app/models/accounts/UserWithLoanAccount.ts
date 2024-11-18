import { LoanAccount } from './LoanAccount';
import { Users } from './users';

export interface UserWithLoanAccount {
  user: Users | null;
  loanAccount: LoanAccount | null;
}
