import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Users } from './models/accounts/users';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'fintrack';

  constructor(private authService: AuthService) {}
}
