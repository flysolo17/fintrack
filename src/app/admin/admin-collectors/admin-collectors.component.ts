import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCollectorComponent } from '../modals/create-collector/create-collector.component';
import { AuthService } from '../../services/auth.service';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { Users } from '../../models/accounts/users';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';

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
  users$ = this.authService.getAllCollectors();
  collector$: Observable<Users[]> = this.getFilteredCollectors();
  searchControl = new FormControl(''); // Create FormControl for search

  constructor(private authService: AuthService, private toastr: ToastrService) {
    this.searchControl.valueChanges.subscribe(() => {
      this.collector$ = this.getFilteredCollectors();
    });
  }

  deleteColletor(uid: string) {
    this.authService
      .deleteCollector(uid)
      .then(() => this.toastr.success('Successfully Deleted'))
      .catch((err) => this.toastr.error(err['message']));
  }

  private getFilteredCollectors(): Observable<Users[]> {
    return this.users$.pipe(
      map((users) => users.filter((user) => this.isUserMatchingSearch(user)))
    );
  }
  private isUserMatchingSearch(user: any): boolean {
    const searchTermLower = this.searchControl.value?.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchTermLower) ||
      user.middleName.toLowerCase().includes(searchTermLower) ||
      user.lastName.toLowerCase().includes(searchTermLower) ||
      user.username.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
  }
}
