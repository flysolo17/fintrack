import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Users, UserType } from './models/accounts/users';
import { Router } from '@angular/router';
import { PdfGenerationService } from './services/pdf-generation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'fintrack';

  constructor(
    private authService: AuthService,
    private router: Router,
    private pdfGenerationService: PdfGenerationService
  ) {}

  ngOnInit(): void {
    let uid = localStorage.getItem('uid');
    if (uid !== null) {
      this.authService.getUserByID(uid).subscribe((data) => {
        console.log(data);
        this.authService.setUser(data);
        console.log(this.authService.users$);
      });
    }
  }

  navigateToMainPage(type: UserType) {
    if (type == UserType.ADMIN) {
      this.router.navigate(['admin']);
    } else if (type == UserType.COLLECTOR) {
      this.router.navigate(['collector']);
    } else if (type == UserType.BORROWER) {
      this.router.navigate(['borrower']);
    } else {
      this.router.navigate(['login']);
    }
  }
}
