import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { from } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor() {}

  sendAuthenthicationEmail(name: string, email: string, messageHtml: string) {
    return emailjs.send(
      'service_n3mc3qr',
      'template_ldc1av4',
      {
        from_name: 'Fintrack Admin',
        subject: 'Email Verification',
        message: messageHtml,
        to_email: email,
        from_email: 'fintrack.admin@gmail.com',
      },
      {
        publicKey: 't4ID7_RoVvomOsorH',
      }
    );
  }
}
