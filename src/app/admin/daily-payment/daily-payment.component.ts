import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
interface PaymentRow {
  date: string;
  paymentId: string;
  customer: string;
  method: string;
  amount: string;
  status: string;
  notes: string;
}

@Component({
  selector: 'app-daily-payment',
  templateUrl: './daily-payment.component.html',
  styleUrls: ['./daily-payment.component.css']
})
export class DailyPaymentComponent implements AfterViewInit {
  @ViewChild('dateFilter') dateFilter!: ElementRef;
  @ViewChild('methodFilter') methodFilter!: ElementRef;
  @ViewChild('statusFilter') statusFilter!: ElementRef;
  @ViewChild('paymentTable') paymentTable!: ElementRef;

  payments: PaymentRow[] = [
    { date: '11/29/2024', paymentId: '12345', customer: 'John D.', method: 'cash', amount: '$200', status: 'paid', notes: 'Service A' },
    { date: '11/29/2024', paymentId: '12346', customer: 'Alice M.', method: 'credit', amount: '$150', status: 'pending', notes: 'Service B' },
    { date: '11/29/2024', paymentId: '12347', customer: 'Bob S.', method: 'online', amount: '$300', status: 'paid', notes: 'Product X' },
    { date: '11/29/2024', paymentId: '12348', customer: 'Emma R.', method: 'card', amount: '$100', status: 'overdue', notes: 'Service C' },
  ];

  filteredPayments: PaymentRow[] = [...this.payments]; // Copy the payments array initially

  ngAfterViewInit(): void {
    this.addEventListeners();
  }

  addEventListeners(): void {
    this.dateFilter.nativeElement.addEventListener('change', this.filterTable.bind(this));
    this.methodFilter.nativeElement.addEventListener('change', this.filterTable.bind(this));
    this.statusFilter.nativeElement.addEventListener('change', this.filterTable.bind(this));
  }

  filterTable(): void {
    const dateFilterValue = this.dateFilter.nativeElement.value;
    const methodFilterValue = this.methodFilter.nativeElement.value;
    const statusFilterValue = this.statusFilter.nativeElement.value;

    // Filter the payments array based on the values of the filters
    this.filteredPayments = this.payments.filter(payment => {
      const matchesDate = !dateFilterValue || payment.date === dateFilterValue;
      const matchesMethod = methodFilterValue === 'all' || payment.method === methodFilterValue;
      const matchesStatus = statusFilterValue === 'all' || payment.status === statusFilterValue;

      return matchesDate && matchesMethod && matchesStatus;
    });
  }

  // Function to add rows dynamically (can be used for adding new payments)
  addRow(payment: PaymentRow): void {
    this.payments.push(payment); // Add to the payments array
    this.filterTable(); // Reapply filters
  }
}
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecase'
})
export class TitlecasePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}