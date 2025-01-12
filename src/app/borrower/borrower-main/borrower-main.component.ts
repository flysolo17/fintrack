import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBars,
  faBox,
  faFile,
  faHistory,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
interface Tabs {
  label: string;
  route: string;
  selectedIcon: IconDefinition;
}

@Component({
  selector: 'app-borrower-main',
  templateUrl: './borrower-main.component.html',
  styleUrl: './borrower-main.component.css',
})
export class BorrowerMainComponent implements OnInit {
  hamburger = faBars;
  tabs: Tabs[] = [
    {
      label: 'Home',
      route: 'home',
      selectedIcon: faBox,
    },
    {
      label: 'History',
      route: 'history',
      selectedIcon: faHistory,
    },
    {
      label: 'Documents',
      route: 'documents',
      selectedIcon: faFile,
    },

    {
      label: 'Profile',
      route: 'profile',
      selectedIcon: faUser,
    },
  ];
  isCollapsed = false;
  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.cdr.detectChanges();
  }
  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
