import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
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
  ],
  imports: [BrowserModule, AppRoutingModule, NgbModule],
  providers: [
    provideFirebaseApp(() => initializeApp(environment)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
