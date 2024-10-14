import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
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

import { CreateLoanComponent } from './collector/create-loan/create-loan.component';
import { CollectorHomeComponent } from './collector/collector-home/collector-home.component';
import { ImagePickerComponent } from './utils/image-picker/image-picker.component';
import { CollectorDashboardComponent } from './collector-dashboard/collector-dashboard.component';

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
    CollectorHomeComponent,
    ImagePickerComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, NgbModule, ReactiveFormsModule],
  providers: [
    provideFirebaseApp(() => initializeApp(environment)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
