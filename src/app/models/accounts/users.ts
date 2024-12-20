import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Identifications } from './Identifications';

export interface Users {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  profile: string | null;
  type: UserType;
  phone: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
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
