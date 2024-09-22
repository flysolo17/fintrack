import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './landing-page/home/home.component';
import { AboutComponent } from './landing-page/about/about.component';
import { ContactComponent } from './landing-page/contact/contact.component';
import { LandingMainComponent } from './landing-page/landing-main/landing-main.component';
import { AdminMainComponent } from './admin/admin-main/admin-main.component';
import { BorrowerMainComponent } from './borrower/borrower-main/borrower-main.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing-page',
    pathMatch: 'full',
  },
  {
    path: 'landing-page',
    component: LandingMainComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
    ],
  },

  {
    path: 'admin',
    component: AdminMainComponent,
    children: [],
  },
  {
    path: 'borrower',
    component: BorrowerMainComponent,
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
