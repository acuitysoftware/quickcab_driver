import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';

@Component({
  selector: 'app-viewbookings',
  templateUrl: './viewbookings.page.html',
  styleUrls: ['./viewbookings.page.scss'],
})
export class ViewbookingsPage implements OnInit {
  bookings = [];
  bookingcounts = 2;
  newreq = 0;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  profileimage = "https://quickcabtaxiservice.com/storage/app/public/customer.png";
  imagepath = "https://quickcabtaxiservice.com/storage/app/public/";
  driveintv: any;
  isAndroid = false;
  constructor(
    private platform: Platform,
    private route: Router,
    private loader: LoadingController,
    private toast: ToastController,
    private service: ServicesService,

  ) { }

  async ionViewWillLeave(){
    if(this.driveintv){
      clearInterval(this.driveintv);
    }
  }

  playAudio(){
    let audio = new Audio();
    audio.pause();
    audio.src = "https://quickcabtaxiservice.com/storage/app/public/app_notification_sound/newbook.wav";
    audio.load();
    audio.play();

    setTimeout(function(){
        audio.pause();
        audio.currentTime = 0;
    }, 5000);
  }

  async ngOnInit() {
    this.platform.ready().then(async () => {

      if (this.platform.platforms().includes("android")){
        this.isAndroid = true
    }

      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', function (event) {
          event.preventDefault();
          event.stopPropagation();
        }, false);
      });
      let ld = this.loader.create({
        message: "Fetching Booking Details"
      });
      (await ld).present().then(() => {
        let servicedata = {
          driver_id: this.driverid
        }
        this.service.GetUserBookingsService(servicedata).subscribe(
          data => {
            console.log("booking data:", data);

            if (!!data && data.success == true) {
              this.newreq = data.booked_users.length;
              if (data.booked_users.length > 0) {
                // this.audio.play('caralarm1')
                for (let i = 0; i < data.booked_users.length; i++) {
                  let rideid = data.booked_users[i].id;
                  let sdata = {
                    ride_id: rideid
                  };
                  this.service.GetRideDetailsService(sdata).subscribe(
                    ridedata => {
                      console.log("ride data = ", ridedata);
                      let prc = ridedata.totalprice;
                      if (!!ridedata && ridedata.success == true) {
                        data.booked_users[i].estimated_price = Math.round(prc);
                      }
                    }
                  )
                }

                this.playAudio();

                this.bookings = data.booked_users;
                this.bookingcounts = 1;
                this.loader.dismiss();

              }
              else {
                this.bookings = [];
                this.bookingcounts = 0;
                this.loader.dismiss();
              }
            }
            console.log(this.bookings);

          }
        );
        this.driveintv = setInterval(() => {
          let servicedata = {
            driver_id: this.driverid
          }

          this.service.GetUserBookingsService(servicedata).subscribe(
            data => {
              console.log(data);

              if (!!data && data.success == true) {
                this.newreq = data.booked_users.length;
                if (data.booked_users.length > 0) {
                  // this.audio.play('caralarm1')
                  
                  for (let i = 0; i < data.booked_users.length; i++) {
                    let rideid = data.booked_users[i].id;
                    let sdata = {
                      ride_id: rideid
                    };
                    this.service.GetRideDetailsService(sdata).subscribe(
                      ridedata => {
                        console.log("ride data = ", ridedata);
                        let prc = ridedata.totalprice;
                        if (!!ridedata && ridedata.success == true) {
                          data.booked_users[i].estimated_price = Math.round(prc)
                        }
                      }
                    )
                  }

                  this.playAudio();

                  this.bookings = data.booked_users;
                  this.bookingcounts = 1;

                }
                else {
                  this.bookings = [];
                  this.bookingcounts = 0;
                }
              }
              console.log("bookings:- ", this.bookings);

            }
          );
        }, 8000);

      })
    })
  }

  gohomepage() {
   this.route.navigate(['/pages/home']).then(() => {
      window.location.reload();
    })
    //this.route.navigate(['/pages/home']);
  }

  async acceptbooking(rideid, driver, user) {
    // this.audio.stop('caralarm1');

    if (this.driveintv) {
      clearInterval(this.driveintv);
    }

    let ld = this.loader.create({
      message: 'Accepting Ride.......'
    });
    (await ld).present().then(async () => {
      let servicedata = {
        driver_id: driver,
        user_id: user,
        current_status: 2
      };
      this.service.DriverAcceptBookingService(servicedata).subscribe(
        async data => {
          this.loader.dismiss();
          if (!!data && data.success == true) {
            
           this.route.navigate(['/pages/ridedirection/' + rideid]).then(() => {
              window.location.reload();
            });
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "Cannot Accept Ride. Server Error ! Try Again Later Please!",
              duration: 2500
            });
            (await tm).present().then(() => {
              window.location.reload();
            })
          }
        }
      )
    });
  }

  async rejectbooking(driver, user) {
    // this.audio.stop('caralarm1');
    if (this.driveintv) {
      clearInterval(this.driveintv);
    }
    let ld = this.loader.create({
      message: "Cancelling Ride......"
    });
    (await ld).present().then(async () => {
      let servicedata = {
        driver_id: driver,
        user_id: user,
        current_status: 6
      };
      this.service.DriverCancelBookingService(servicedata).subscribe(
        async data => {
          if (!!data && data.success == true) {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "Cancelled Ride",
              duration: 1500
            });
            (await tm).present().then(() => {
              window.location.reload();
            })
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: "Cannot Cancel Ride! Server Error! Try Again Later Please!",
              duration: 2500
            });
            (await tm).present().then(() => {
              window.location.reload();
            });
          }
        }
      );
    })
  }

}
