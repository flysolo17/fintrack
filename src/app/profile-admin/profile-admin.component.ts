import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Users } from '../models/accounts/users';
import { user } from '@angular/fire/auth';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditProfileComponent } from '../auth/edit-profile/edit-profile.component';
import { VerificationComponent } from '../auth/verification/verification.component';
import { ChangePasswordComponent } from '../auth/change-password/change-password.component';
import { EncryptionService } from '../services/encryption.service';
import { EmailService } from '../services/email.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-admin',
  templateUrl: './profile-admin.component.html',
  styleUrls: ['./profile-admin.component.css'],
})
export class ProfileAdminComponent implements OnInit {
  defaultPicture = '../../assets/profile.png';
  users$: Users | null = null;
  private modalService = inject(NgbModal);
  constructor(
    private authService: AuthService,
    private encryptionService: EncryptionService,
    private emailService: EmailService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = localStorage.getItem('uid') ?? '';
    if (id !== '') {
      this.authService.getUserByID(id).subscribe((data) => {
        this.users$ = data;
      });
    }
  }

  verify(phone: string) {
    let modal = this.modalService.open(VerificationComponent);
    modal.componentInstance.phone = phone;
  }
  updateProfile(): void {
    alert('Profile updated successfully!');
  }

  cancelEdit(): void {
    console.log('Edit canceled');
  }

  onPictureSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (this.users$?.id !== null && file !== undefined) {
      this.authService.changeProfile(this.users$?.id!!, file);
    }
  }

  changeProfile(): void {
    let modal = this.modalService.open(EditProfileComponent);
    modal.componentInstance.user = this.users$;
  }

  changePassword(): void {
    let modal = this.modalService.open(ChangePasswordComponent);
    modal.componentInstance.user = this.users$;
  }

  sendEmailVerification(): void {
    const firstName = this.users$?.username ?? '';
    const email = this.users$?.email ?? '';

    const verificationLink = `https://fintrack-75b03.web.app/email-verification/${email}`;

    const emailContent = `
    "Please click the link below to verify your email address.${verificationLink}`;
    this.emailService
      .sendAuthenthicationEmail(firstName, email, emailContent)
      .then(() => {
        this.toastr.success('Verification email sent successfully');
      })
      .catch((e) => {
        this.toastr.error('Error sending verification email');
      });
  }

  logout() {
    this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
      this.router.resetConfig(this.router.config);
    });
  }
}
