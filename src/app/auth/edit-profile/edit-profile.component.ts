import { Component, inject, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Users } from '../../models/accounts/users';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css',
})
export class EditProfileComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  @Input() user!: Users;

  userForm$: FormGroup;
  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.userForm$ = fb.group({
      firstName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    if (this.user) {
      this.userForm$.patchValue({
        firstName: this.user.firstName || '',
        middleName: this.user.middleName || '',
        lastName: this.user.lastName || '',
        phone: this.user.phone || '',
      });
    }
  }
  saveChanges(): void {
    if (this.userForm$.valid) {
      let form = this.userForm$.value;
      let uid = this.user.id;
      if (uid !== null) {
        this.authService.editUser(
          uid,
          form.firstName,
          form.middleName,
          form.lastName
        );
        this.activeModal.close();
      }
    }
  }
}
