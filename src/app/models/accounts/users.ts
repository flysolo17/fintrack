import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Identifications } from './Identifications';

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}
export interface Users {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profile: string | null;
  type: UserType;
  phone: string;
  email: string;
  verified: boolean;
  username: string;
  password: string;
  createdAt: Date;
  accountStatus: AccountStatus;
  address: string;
}

export const userConverter = {
  toFirestore: (data: Users) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const user = snap.data() as Users;
    user.createdAt = (user.createdAt as any).toDate();
    return user;
  },
};

export enum UserType {
  ADMIN = 'ADMIN',
  COLLECTOR = 'COLLECTOR',
  BORROWER = 'BORROWER',
}
