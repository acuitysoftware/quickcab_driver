import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SigninotpPageRoutingModule } from './signinotp-routing.module';

import { SigninotpPage } from './signinotp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SigninotpPageRoutingModule
  ],
  declarations: [SigninotpPage]
})
export class SigninotpPageModule {}
