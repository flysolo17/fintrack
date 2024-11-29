import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-record',
  templateUrl: './payment-record.component.html',
  styleUrls: ['./payment-record.component.css']
})
export class PaymentRecordComponent {
  paymentRecord = {
    borrowerName: '',
    loanAmount: null,
    paymentAmount: null,
    paymentDate: '',
    paymentStatus: ''
  };

  constructor() {}

  onSubmit() {
    console.log('Payment Record Submitted:', this.paymentRecord);
    // Here you can send the record to the backend or do any additional processing.
  }
}
