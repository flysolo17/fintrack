import { Users } from '../accounts/users';
import { Loans } from './loan';

export interface LoanWithBorrowerAndCollector {
  loan: Loans | null;
  borrower: Users | null;
  collector: Users | null;
}
