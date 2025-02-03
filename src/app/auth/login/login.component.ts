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
      type: [null, Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async login() {
    if (this.loginForm$.invalid) {
      this.toastr.error('Invalid username or password');
      return;
    }

    const { username, password, type } = this.loginForm$.value;

    try {
      const user = await this.authService.login(username, password);

      if (user) {
        if (user?.type !== type) {
          console.log(user?.type, type);
          this.toastr.error('Invalid User type');
          return;
        }
        this.authService.setUser(user);
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
