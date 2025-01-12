import { Component, inject, Input, OnInit } from '@angular/core';
import { WindowService } from '../../services/window.service';
import { Auth, RecaptchaVerifier } from '@angular/fire/auth';
import { formatPhoneNumber } from '../../utils/Constants';
import { AuthService } from '../../services/auth.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css',
})
export class VerificationComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() phone!: string;
  windowRef: any;
  verificationCode: string = '';

  constructor(
    private windowService: WindowService,
    private auth: Auth,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.windowRef = this.windowService.windowRef;
    this.windowRef.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha-container'
    );
    this.windowRef.recaptchaVerifier.render();
  }

  sendVerification() {
    const appVerifier = this.windowRef.recaptchaVerifier;
    const phone = formatPhoneNumber(this.phone);
    this.authService
      .sendVerificationCode(phone, appVerifier)
      .then((data) => {
        this.windowRef.confirmationResult = data;
      })
      .catch((e) => console.log(e));
  }

  verifyCode() {
    this.windowRef.confirmationResult
      .confirm(this.verificationCode)
      .then((result: any) => {
        console.log(result);
        alert(result);
      })
      .catch((err: any) => {
        alert(err);
        console.log(err);
      });
  }
}
