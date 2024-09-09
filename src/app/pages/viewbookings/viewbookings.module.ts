import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewbookingsPageRoutingModule } from './viewbookings-routing.module';

import { ViewbookingsPage } from './viewbookings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewbookingsPageRoutingModule
  ],
  declarations: [ViewbookingsPage]
})
export class ViewbookingsPageModule {}
