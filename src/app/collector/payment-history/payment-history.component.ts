import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {

  // Array of payment data
  payments = [
    { id: 1, name: 'John Doe', date: '2024-11-15', amount: 150, status: 'Completed', method: 'Credit Card' },
    { id: 2, name: 'Jane Smith', date: '2024-11-14', amount: 200, status: 'Pending', method: 'Bank Transfer' },
    { id: 3, name: 'Michael Johnson', date: '2024-11-10', amount: 100, status: 'Failed', method: 'PayPal' },
    // Add more payment records as needed
  ];

  // Array to hold filtered payment data
  filteredPayments = [...this.payments];

  // Search query
  searchQuery: string = '';

  constructor() { }

  ngOnInit(): void {
    // Initial filtering on load (if needed)
    this.searchTable();
  }

  // Method to filter payments based on the search query
  searchTable(): void {
    const query = this.searchQuery.toLowerCase();

    // Filter payments based on matching name, date, or amount
    this.filteredPayments = this.payments.filter(payment => {
      return payment.name.toLowerCase().includes(query) ||
             payment.date.includes(query) ||
             payment.amount.toString().includes(query);
    });
  }
}
