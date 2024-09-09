import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ForgotpasswordotpPageRoutingModule } from './forgotpasswordotp-routing.module';

import { ForgotpasswordotpPage } from './forgotpasswordotp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgotpasswordotpPageRoutingModule
  ],
  declarations: [ForgotpasswordotpPage]
})
export class ForgotpasswordotpPageModule {}
