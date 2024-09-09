import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TripotpPageRoutingModule } from './tripotp-routing.module';

import { TripotpPage } from './tripotp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TripotpPageRoutingModule
  ],
  declarations: [TripotpPage]
})
export class TripotpPageModule {}
