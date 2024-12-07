import { Component } from '@angular/core';
import { ImagePickerComponent } from "../../../utils/image-picker/image-picker.component";
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-borrower',
  templateUrl: './create-borrower.component.html',
  styleUrl: './create-borrower.component.css',
  imports: [ImagePickerComponent],


  
})
export class CreateBorrowerComponent {
accountInfoForm$: FormGroup<any> | undefined;
submitAccountInfo() {
throw new Error('Method not implemented.');
}
uploadSelected($event: Event) {
throw new Error('Method not implemented.');
}
}
