import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Identifications } from '../../models/accounts/Identifications';
import { AuthService } from '../../services/auth.service';
import { Users } from '../../models/accounts/users';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
})
export class DocumentsComponent implements OnInit {
  identifications$: Observable<Identifications | null> = of(null);
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    let id = localStorage.getItem('uid') ?? '';
    this.authService.getUserByID(id).subscribe((data: Users | null) => {
      if (data != null) {
        this.identifications$ = this.authService.getIdentifications(
          data.username
        );
      }
    });
  }

  formatTitle(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
