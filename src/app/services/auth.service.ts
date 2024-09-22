import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  docData,
  Firestore,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { userConverter, Users, UserType } from '../models/users';
import { EncryptionService } from './encryption.service';
import { generateRandomString } from '../utils/Constants';
import { user } from '@angular/fire/auth';
import { from, map, Observable } from 'rxjs';
export const AUTH_COLLECTION = 'users';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private firestore: Firestore,
    private encriptionService: EncryptionService
  ) {}

  login(
    username: string,
    password: string
  ): Observable<Users | null | undefined> {
    const q = query(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      where('username', '==', username),
      limit(1)
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return null;
        }

        const userDoc = snapshot.docs[0];
        const user = userDoc.data() as Users;
        const decryptedPassword = this.encriptionService.decrypt(user.password);
        if (decryptedPassword === password) {
          return user;
        } else {
          return null;
        }
      })
    );
  }
}
