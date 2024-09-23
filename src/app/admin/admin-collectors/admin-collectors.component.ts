import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCollectorComponent } from '../modals/create-collector/create-collector.component';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { Users } from '../../models/users';

@Component({
  selector: 'app-admin-collectors',
  templateUrl: './admin-collectors.component.html',
  styleUrl: './admin-collectors.component.css',
})
export class AdminCollectorsComponent {
  modalService$ = inject(NgbModal);

  createCollector() {
    const modal = this.modalService$.open(CreateCollectorComponent, {
      size: 'xl',
    });
  }
  collector$: Observable<Users[]> = this.authService.getAllCollectors();
  constructor(private authService: AuthService) {}
}
