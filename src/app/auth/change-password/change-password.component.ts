import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Users } from '../../models/accounts/users';
import { EncryptionService } from '../../services/encryption.service';
import { validatePassword } from '@angular/fire/auth';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() user!: Users;
  changePasswordForm$: FormGroup;
  newPasswordMismatch: boolean = false;
  constructor(
    private fb: FormBuilder,
    private encryptionService: EncryptionService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.changePasswordForm$ = fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.changePasswordForm$
      .get('confirmPassword')
      ?.valueChanges.subscribe(() => {
        this.checkPasswordMatch();
      });
  }
  submit(): void {
    if (this.changePasswordForm$.valid && !this.newPasswordMismatch) {
      let form = this.changePasswordForm$.value;
      let newPassword = form.newPassword;
      this.changeUserPassword(form.currentPassword, newPassword);
    }
  }
  checkPasswordMatch(): void {
    const newPassword = this.changePasswordForm$.get('newPassword')?.value;
    const confirmPassword =
      this.changePasswordForm$.get('confirmPassword')?.value;
    this.newPasswordMismatch = newPassword !== confirmPassword;
  }

  changeUserPassword(currentPassword: string, newPassword: string): void {
    const decryptedStoredPassword = this.encryptionService.decrypt(
      this.user.password
    );

    console.log('CURRENT :', currentPassword);
    console.log('STORED : ', decryptedStoredPassword);
    if (currentPassword !== decryptedStoredPassword) {
      this.changePasswordForm$.setErrors({ invalidPassword: true });
      return;
    }

    let uid = this.user.id;
    if (uid === null) {
      this.toastr.error('No user found!');
      return;
    }

    this.authService.changePassword(uid, newPassword);
    this.activeModal.close();
  }
}
