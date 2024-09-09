import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CredentialsPage } from './credentials.page';

const routes: Routes = [
  
  {
    path: '',
    component: CredentialsPage
  },
  {
    path: 'signin',
    loadChildren: () => import('./signin/signin.module').then(m => m.SigninPageModule)
  },
  {
    path: 'forgotpassword',
    loadChildren: () => import('./forgotpassword/forgotpassword.module').then(m => m.ForgotpasswordPageModule)
  },
  {
    path: 'signupotp/:driverid',
    loadChildren: () => import('./signupotp/signupotp.module').then(m => m.SignupotpPageModule)
  },
  {
    path: 'termsandconditions',
    loadChildren: () => import('./termsandconditions/termsandconditions.module').then( m => m.TermsandconditionsPageModule)
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CredentialsPageRoutingModule { }
