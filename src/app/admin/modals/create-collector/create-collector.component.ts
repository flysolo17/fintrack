import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Users, UserType } from '../../../models/accounts/users';
import { generateRandomString } from '../../../utils/Constants';

@Component({
  selector: 'app-create-collector',
  templateUrl: './create-collector.component.html',
  styleUrl: './create-collector.component.css',
})
export class CreateCollectorComponent {
  activeModal$ = inject(NgbActiveModal);
  collectorForm$: FormGroup;
  selectedFile: File | null = null;
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.collectorForm$ = fb.nonNullable.group({
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: ['', Validators.required],
      profile: ['', Validators.required],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async createCollector() {
    if (this.collectorForm$.invalid || this.selectedFile == null) {
      alert('Invalid Collector Data or Profile Picture Missing');
      return;
    }

    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      username,
      password,
    } = this.collectorForm$.value;

    const user: Users = {
      id: generateRandomString(18),
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      profile: null,
      type: UserType.COLLECTOR,
      phone: phone,
      email: email,
      username: username,
      password: password,
      createdAt: new Date(),
    };

    try {
      let isExist = await this.authService.checkUserIfExists(user.username);
      if (isExist) {
        alert('User exists');
        return;
      }
      await this.authService.createCollector(user, this.selectedFile);
      alert('Collector created successfully!');
      // Reset the form or navigate to another page
      this.collectorForm$.reset();
      this.selectedFile = null;
      this.activeModal$.close();
    } catch (error) {
      console.error('Error creating collector:', error);
      alert(
        'An error occurred while creating the collector. Please try again.'
      );
    }
  }
}
