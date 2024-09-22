import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Users } from './models/users';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'fintrack';

  constructor(private authService: AuthService) {}
  login() {
    this.authService.login('fintrackadmin', 'admin1234').subscribe({
      error: (err: any) => alert(err['message']),
      next: (data: Users | null | undefined) => alert(data?.email),
    });
  }
}
