import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookinghistoryPageRoutingModule } from './bookinghistory-routing.module';

import { BookinghistoryPage } from './bookinghistory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookinghistoryPageRoutingModule
  ],
  declarations: [BookinghistoryPage]
})
export class BookinghistoryPageModule {}
