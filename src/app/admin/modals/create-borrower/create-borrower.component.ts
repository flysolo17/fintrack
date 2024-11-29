import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { generateRandomString } from '../../../utils/Constants';
import { Users, UserType } from '../../../models/accounts/users';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-borrower',
  templateUrl: './create-borrower.component.html',
  styleUrl: './create-borrower.component.css'
})
export class CreateBorrowerComponent {
 
    activeModal$ = inject(NgbActiveModal);
    collectorForm$: FormGroup;
    selectedFile: File | null = null;
borrowerForm$: any;
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
        alert('Borrower created successfully!');
        // Reset the form or navigate to another page
        this.collectorForm$.reset();
        this.selectedFile = null;
        this.activeModal$.close();
      } catch (error) {
        console.error('Error creating Borrower:', error);
        alert(
          'An error occurred while creating the Borrower. Please try again.'
        );
      }
    }
  }

