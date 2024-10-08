import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './landing-page/home/home.component';
import { AboutComponent } from './landing-page/about/about.component';
import { ContactComponent } from './landing-page/contact/contact.component';
import { LandingMainComponent } from './landing-page/landing-main/landing-main.component';
import { AdminMainComponent } from './admin/admin-main/admin-main.component';
import { BorrowerMainComponent } from './borrower/borrower-main/borrower-main.component';
import { LoginComponent } from './auth/login/login.component';
import { CollectorMainComponent } from './collector/collector-main/collector-main.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminCollectorsComponent } from './admin/admin-collectors/admin-collectors.component';

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
    path: 'login',
    component: LoginComponent,
    children: [],
  },

  {
    path: 'admin',
    component: AdminMainComponent,
    children: [
      {
        path: '',
        component: AdminDashboardComponent,
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'collectors',
        component: AdminCollectorsComponent,
      },
    ],
  },
  {
    path: 'borrower',
    component: BorrowerMainComponent,
    children: [],
  },
  {
    path: 'collector',
    component: CollectorMainComponent,
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
