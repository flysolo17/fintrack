import { Component, OnInit } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.css',
})
export class EmailVerificationComponent implements OnInit {
  isVerified = false;

  email: string = '';
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getEmailFromUrl();
  }

  getEmailFromUrl() {
    this.route.paramMap.subscribe((params) => {
      this.email = params.get('email') ?? '';
      this.verifyEmail(this.email);
    });
  }

  verifyEmail(email: string) {
    this.authService
      .verifyUser(email)
      .then((res) => {
        this.isVerified = true;
        this.toastr.success('Email verified successfully');
      })
      .catch((err) => {
        this.toastr.error('Error verifying email');
      });
  }
}
