import { User } from '@angular/fire/auth';
import { Identifications } from '../accounts/Identifications';
import { LoanAccount } from '../accounts/LoanAccount';
import { Users } from '../accounts/users';
import { LoanHistory } from './loan-history';
import { Loans } from './loan';

//Data for View Loan Account
//this page can view , User,LoanAccount , Loan Doucments and Loan History
//this page can make a loan for a user if loan account has available ammount

export interface LoanWithUserAndDocuments {
  user: Users | null;
  document: Identifications | null;
  loanAccount: LoanAccount | null;
}
