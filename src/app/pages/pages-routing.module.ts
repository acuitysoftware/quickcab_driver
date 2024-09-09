import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PagesPage } from './pages.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/pages/home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: PagesPage,
    children: [
      { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
      { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule) },
      {
        path: 'changepassword',
        loadChildren: () => import('./changepassword/changepassword.module').then(m => m.ChangepasswordPageModule)
      },
      {
        path: 'bookinghistory',
        loadChildren: () => import('./bookinghistory/bookinghistory.module').then(m => m.BookinghistoryPageModule)
      },
      {
        path: 'paymenthistory',
        loadChildren: () => import('./paymenthistory/paymenthistory.module').then(m => m.PaymenthistoryPageModule)
      },
      {
        path: 'documentmanagement',
        loadChildren: () => import('./documentmanagement/documentmanagement.module').then(m => m.DocumentmanagementPageModule)
      },
      {
        path: 'carmanagement',
        loadChildren: () => import('./carmanagement/carmanagement.module').then(m => m.CarmanagementPageModule)
      },
      {
        path: 'viewbookings',
        loadChildren: () => import('./viewbookings/viewbookings.module').then(m => m.ViewbookingsPageModule)
      },
      {
        path: 'ridedirection/:rideid',
        loadChildren: () => import('./ridedirection/ridedirection.module').then(m => m.RidedirectionPageModule)
      },
      {
        path: 'tripotp/:tripid',
        loadChildren: () => import('./tripotp/tripotp.module').then(m => m.TripotpPageModule)
      },
      {
        path: 'ongoingtrip/:ontripid',
        loadChildren: () => import('./ongoingtrip/ongoingtrip.module').then(m => m.OngoingtripPageModule)
      },
      {
        path: 'tripsummary/:tripsummaryid',
        loadChildren: () => import('./tripsummary/tripsummary.module').then(m => m.TripsummaryPageModule)
      },
      // {
      //   path: 'othermappage/:maprideid',
      //   loadChildren: () => import('./othermappage/othermappage.module').then(m => m.OthermappagePageModule)
      // },

    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesPageRoutingModule { }
