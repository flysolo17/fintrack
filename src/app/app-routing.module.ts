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
import { CollectorHomeComponent } from './collector/collector-home/collector-home.component';
import { CreateLoanComponent } from './loan/create-loan/create-loan.component';
import { CollectorDashboardComponent } from './collector-dashboard/collector-dashboard.component';
import { LoanTypeComponent } from './admin/loan-type/loan-type.component';
import { PaymentRecordComponent } from './collector/payment-record/payment-record.component';
import { PaymentHistoryComponent } from './collector/payment-history/payment-history.component';
import { PerformanceComponent } from './collector/performance/performance.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { BorrowersComponent } from './loan/borrowers/borrowers.component';
import { LoanPlanComponent } from './admin/loan-plan/loan-plan.component';
import { ViewLoanComponent } from './loan/view-loan/view-loan.component';

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

      {
        path: 'borrowers',
        component: BorrowersComponent,
      },
      {
        path: 'borrowers/:id',
        component: ViewLoanComponent,
      },
      {
        path: 'create-loan',
        component: CreateLoanComponent,
      },

      {
        path: 'loan-plan',
        component: LoanPlanComponent,
      },
      {
        path: 'loan-type',
        component: LoanTypeComponent,
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
    children: [
      {
        path: '',
        component: CollectorHomeComponent,
      },
      {
        path: 'home',
        component: CollectorHomeComponent,
      },
      {
        path: 'borrowers',
        component: BorrowersComponent,
      },
      {
        path: 'borrowers/:id',
        component: ViewLoanComponent,
      },
      {
        path: 'create-loan',
        component: CreateLoanComponent,
      },
      {
        path: 'record',
        component: PaymentRecordComponent,
      },
      {
        path: 'history',
        component: PaymentHistoryComponent,
      },
      {
        path: 'performance',
        component: PerformanceComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
