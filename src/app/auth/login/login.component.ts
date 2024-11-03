import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserType } from '../../models/accounts/users';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm$: FormGroup;
  hidePassword$: boolean = true;
  togglePasswordVisibility() {
    this.hidePassword$ = !this.hidePassword$;
  }
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm$ = fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async login() {
    if (this.loginForm$.invalid) {
      this.toastr.success('Invalid username or password');
      return;
    }
    const { username, password } = this.loginForm$.value;

    try {
      const user = await this.authService.login(username, password);
      if (user) {
        localStorage.setItem('uid', user.id);
        this.toastr.success('Login successful!');
        this.navigateToMainPage(user.type);
      } else {
        this.toastr.error('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.toastr.error('An error occurred during login. Please try again.');
    }
  }

  navigateToMainPage(type: UserType) {
    if (type == UserType.ADMIN) {
      this.router.navigate(['admin']);
    } else if (type == UserType.COLLECTOR) {
      this.router.navigate(['collector']);
    } else {
      this.router.navigate(['borrower']);
    }
  }
}
