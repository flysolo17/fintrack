import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  NgbDropdownModule,
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment.development';
import { HomeComponent } from './landing-page/home/home.component';
import { AboutComponent } from './landing-page/about/about.component';
import { ContactComponent } from './landing-page/contact/contact.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { EditProfileComponent } from './auth/edit-profile/edit-profile.component';
import { LandingMainComponent } from './landing-page/landing-main/landing-main.component';
import { AdminMainComponent } from './admin/admin-main/admin-main.component';
import { BorrowerMainComponent } from './borrower/borrower-main/borrower-main.component';
import { LoginComponent } from './auth/login/login.component';
import { CollectorMainComponent } from './collector/collector-main/collector-main.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminCollectorsComponent } from './admin/admin-collectors/admin-collectors.component';
import { CreateCollectorComponent } from './admin/modals/create-collector/create-collector.component';
import { CreateLoanComponent } from './loan/create-loan/create-loan.component';
import { CollectorHomeComponent } from './collector/collector-home/collector-home.component';
import { ImagePickerComponent } from './utils/image-picker/image-picker.component';
import { CollectorDashboardComponent } from './collector-dashboard/collector-dashboard.component';
import { CreateLoanTypeComponent } from './admin/modals/create-loan-type/create-loan-type.component';
import { LoanTypeComponent } from './admin/loan-type/loan-type.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { PaymentRecordComponent } from './collector/payment-record/payment-record.component';
import { PaymentHistoryComponent } from './collector/payment-history/payment-history.component';
import { PerformanceComponent } from './collector/performance/performance.component';
import { BorrowersComponent } from './loan/borrowers/borrowers.component';

import { LoanPlanComponent } from './admin/loan-plan/loan-plan.component';
import { ViewLoanComponent } from './loan/view-loan/view-loan.component';
import { MakeLoanComponent } from './loan/dialogs/make-loan/make-loan.component';
import { ConfirmLoanComponent } from './loan/dialogs/confirm-loan/confirm-loan.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { DailyPaymentComponent } from './admin/daily-payment/daily-payment.component';
import { PaymentDialogComponent } from './admin/modals/payment-dialog/payment-dialog.component';
import { BorrowerHomeComponent } from './borrower/borrower-home/borrower-home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    ProfileComponent,
    ForgotPasswordComponent,
    ChangePasswordComponent,
    EditProfileComponent,
    LandingMainComponent,
    AdminMainComponent,
    BorrowerMainComponent,
    LoginComponent,
    CollectorMainComponent,
    AdminDashboardComponent,
    AdminCollectorsComponent,

    CreateCollectorComponent,
    CollectorDashboardComponent,
    CreateLoanComponent,
    BorrowerHomeComponent,
    CollectorHomeComponent,

    CreateLoanTypeComponent,
    LoanTypeComponent,
    DailyPaymentComponent,
    PaymentRecordComponent,
    PaymentHistoryComponent,
    PerformanceComponent,
    BorrowersComponent,

    LoanPlanComponent,
    ViewLoanComponent,
    MakeLoanComponent,
    ConfirmLoanComponent,
    PaymentDialogComponent,
    ImagePickerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    FormsModule,
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
