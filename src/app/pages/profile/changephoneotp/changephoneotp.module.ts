import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChangephoneotpPageRoutingModule } from './changephoneotp-routing.module';

import { ChangephoneotpPage } from './changephoneotp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangephoneotpPageRoutingModule
  ],
  declarations: [ChangephoneotpPage]
})
export class ChangephoneotpPageModule {}
