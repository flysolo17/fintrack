import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { SafeResourceUrl } from '@angular/platform-browser';

export interface Identifications {
  accountID: string;
  first_id: string | null;
  secound_id: string | null;
  third_id: string | null;
  gov_id: string | null;
  barangay_permit: string | null;
  cedula: string | null;
  omeco_bill: string | null;
}

export const identificationConverter = {
  toFirestore: (data: Identifications) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Identifications;

    return data;
  },
};
