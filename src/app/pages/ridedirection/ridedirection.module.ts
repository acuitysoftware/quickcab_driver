import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RidedirectionPageRoutingModule } from './ridedirection-routing.module';

import { RidedirectionPage } from './ridedirection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RidedirectionPageRoutingModule
  ],
  declarations: [RidedirectionPage]
})
export class RidedirectionPageModule {}
