import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignupotpPageRoutingModule } from './signupotp-routing.module';

import { SignupotpPage } from './signupotp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignupotpPageRoutingModule
  ],
  declarations: [SignupotpPage]
})
export class SignupotpPageModule {}
