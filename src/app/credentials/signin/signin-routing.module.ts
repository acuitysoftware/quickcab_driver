import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SigninPage } from './signin.page';

const routes: Routes = [
  {
    path: '',
    component: SigninPage
  },
  {
    path: 'signinotp/:driverid',
    loadChildren: () => import('./signinotp/signinotp.module').then(m => m.SigninotpPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SigninPageRoutingModule { }
