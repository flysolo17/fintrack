import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { userConverter, Users, UserType } from '../models/users';
import { EncryptionService } from './encryption.service';
import { generateRandomString } from '../utils/Constants';
import { User, user } from '@angular/fire/auth';
import { from, map, Observable } from 'rxjs';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
export const AUTH_COLLECTION = 'users';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private encriptionService: EncryptionService
  ) {}

  async login(username: string, password: string): Promise<Users | null> {
    const q = query(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      where('username', '==', username),
      limit(1)
    );

    const snapshot = await getDocs(q);

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
  }

  async checkUserIfExists(username: string): Promise<boolean> {
    try {
      const q = query(
        collection(this.firestore, AUTH_COLLECTION).withConverter(
          userConverter
        ),
        where('username', '==', username),
        limit(1)
      );

      const results = await getDocs(q);

      return !results.empty;
    } catch (err) {
      console.error('Error checking if user exists:', err);
      return false;
    }
  }
  async createCollector(user: Users, file: File) {
    try {
      const encryptedPassword = this.encriptionService.encrypt(user.password);
      user.password = encryptedPassword;
      const profileUrl = await this.uploadFile(file);
      user.profile = profileUrl;

      await setDoc(
        doc(this.firestore, AUTH_COLLECTION, user.id).withConverter(
          userConverter
        ),
        user
      );

      return user;
    } catch (error) {
      console.error('Error creating collector:', error);
      throw error;
    }
  }

  async uploadFile(file: File) {
    try {
      const fireRef = ref(
        this.storage,
        `${AUTH_COLLECTION}/${generateRandomString(19)}`
      );
      await uploadBytes(fireRef, file);
      const downloadURL = await getDownloadURL(fireRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  getAllCollectors(): Observable<Users[]> {
    const q = query(
      collection(this.firestore, AUTH_COLLECTION).withConverter(userConverter),
      where('type', '==', UserType.COLLECTOR),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q);
  }
}
