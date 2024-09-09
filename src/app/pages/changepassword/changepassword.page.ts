import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications/ngx';
import { LoadingController, MenuController, ToastController, Platform } from '@ionic/angular';
import { ServicesService } from 'src/app/services.service';
@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.page.html',
  styleUrls: ['./changepassword.page.scss'],
})
export class ChangepasswordPage implements OnInit {
  bookingcount = 0;
  driverid = JSON.parse(localStorage.getItem('driver_data')).id;
  intervalset01: any;
  public hide = true;
  public hide_confirm = true;
  constructor(
    private menu: MenuController,
    private route: Router,
    private toast: ToastController,
    private service: ServicesService,
    private loader: LoadingController,
    private localpush: LocalNotifications,
    private bgmode: BackgroundMode,
    private platform: Platform,
  ) { }

  playAudio(){
    let audio = new Audio();
    audio.pause();
    audio.src = "https://quickcabtaxiservice.com/storage/app/public/app_notification_sound/newbook.wav";
    audio.load();
    audio.play();

    setTimeout(function(){
        audio.pause();
        audio.currentTime = 0;
    }, 4000);
  }

  async ionViewWillLeave(){
    if(this.intervalset01){
      clearInterval(this.intervalset01);
    }
  }

  ngOnInit() {
   //this.bgmode.enable();

   this.platform.backButton.subscribeWithPriority(9999, () => {
      document.addEventListener('backbutton', function (event) {
        event.preventDefault();
        event.stopPropagation();
      }, false);
    });


    this.intervalset01 = setInterval(() => {
      let servicedata = {
        driver_id: this.driverid
      }

      this.service.GetUserBookingsService(servicedata).subscribe(
        data => {
          console.log(data);

          if (!!data && data.success == true) {
            this.bookingcount = data.booked_users.length;
            if (data.booked_users.length > 0) {
              // this.audio.play('caralarm1')
              this.playAudio();
              this.localpush.schedule({
                id: 1,
                title: 'Quick Cab User Booking ',
                text: 'You Have ' + data.booked_users.length + " New Booking. Please Accept / Reject From QuickCab Driver App.",
                icon: 'https://quickcabtaxiservice.com/storage/app/public/quickcabicon.png'
              })
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

              // this.bookings = data.booked_users;
              // this.bookingcounts = 1;

            }
            else {
              // this.bookings = [];
              this.bookingcount = 0;

            }
          }
          // console.log("bookings:- ", this.bookings);

        }
      );
    }, 6000);
  }

  menuon() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu')
  }

  checkoldpassword() {
    let key = (<HTMLInputElement>document.getElementById('op')).value;

    if (key.length < 1) {
      document.getElementById('op').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('op').style.backgroundColor = '#ffffff';
    }
  }
  checknewpassword() {
    let key = (<HTMLInputElement>document.getElementById('np')).value;

    if (key.length < 6) {
      document.getElementById('np').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('np').style.backgroundColor = '#ffffff';
    }
  }
  checkconfirmpassword() {
    let key = (<HTMLInputElement>document.getElementById('np')).value;

    if (key.length < 6) {
      document.getElementById('cp').style.backgroundColor = '#f9b6ac';
    }
    else {
      document.getElementById('cp').style.backgroundColor = '#ffffff';
    }
  }

  async submitpassword() {
    let checkdata = {
      old_password: (<HTMLInputElement>document.getElementById('op')).value,
      new_password: (<HTMLInputElement>document.getElementById('np')).value,
      confirm_password: (<HTMLInputElement>document.getElementById('cp')).value
    }
    this.validateall(checkdata);
    let validations = this.validatedata(checkdata);
    if (validations['success'] == false) {
      let tm = this.toast.create({
        message: validations['message'],
        duration: 1500,
        color: 'white'
      });
      (await tm).present();
    }
    else {
      let jsondata = {
        old_password: (<HTMLInputElement>document.getElementById('op')).value,
        new_password: (<HTMLInputElement>document.getElementById('np')).value,
        driver_id: this.driverid
      }
      let ld = this.loader.create({
        message: 'Changing Password......'
      });
      (await ld).present().then(() => {
        this.service.DriverChangePasswordService(jsondata).subscribe(async data => {
          if (!!data && data['success'] == true) {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: data.msg,
              duration: 1500,
              color: 'white'
            });
            (await tm).present().then(() => {
              localStorage.clear();
              this.route.navigate(['/credentials/signin']);
            })
          }
          else {
            this.loader.dismiss();
            let tm = this.toast.create({
              message: data.msg,
              duration: 1500,
              color: 'white'
            });
            (await tm).present();
            document.getElementById('op').style.backgroundColor = '#f9b6ac';
          }
        })
      });

    }
  }

  validateall(cd) {
    if (cd['old_password'].length < 1) {
      document.getElementById('op').style.backgroundColor = '#f9b6ac';
    }
    if (cd['new_password'].length < 6) {
      document.getElementById('np').style.backgroundColor = '#f9b6ac';
    }
    if (cd['new_password'].length > 5) {
      document.getElementById('np').style.backgroundColor = '#ffffff';
    }
    if (cd['confirm_password'].length < 6) {
      document.getElementById('cp').style.backgroundColor = '#f9b6ac';
    }
    if (cd['confirm_password'].length > 5) {
      document.getElementById('np').style.backgroundColor = '#ffffff';
      document.getElementById('cp').style.backgroundColor = '#ffffff';
    }
    if (cd['confirm_password'] != cd['new_password']) {
      document.getElementById('np').style.backgroundColor = '#f9b6ac';
      document.getElementById('cp').style.backgroundColor = '#f9b6ac';
    }
  }

  validatedata(cd) {
    if (cd['old_password'].length < 1) {
      let codes = {
        success: false,
        message: 'Please Enter Your Current Password'
      }
      return codes;
    }
    else {
      if (cd['new_password'].length < 1) {
        let codes = {
          success: false,
          message: 'Please Enter Your New Password'
        }
        return codes;
      }
      else {
        if (cd['new_password'].length < 6) {
          let codes = {
            success: false,
            message: 'Password Should Be Minimum Of 6 Chanracters.'
          }
          return codes;
        }
        else {
          if (cd['confirm_password'].length < 1) {
            let codes = {
              success: false,
              message: 'Please Confirm Your New Password'
            }
            return codes;
          }
          else {
            if (cd['confirm_password'] != cd['new_password']) {
              let codes = {
                success: false,
                message: 'New & Confirm Password doesn’t match. Please try again.'
              }
              return codes;
            }
            else {
              let codes = {
                success: true,
                message: 'All Data Validated'
              }
              return codes;
            }
          }
        }
      }
    }
  }

  viewbookings() {
    this.bgmode.disable();
    this.localpush.clearAll();
    clearInterval(this.intervalset01);
   /* (<HTMLAudioElement>document.getElementById('bgalert')).pause();*/
    this.route.navigate(['/pages/viewbookings']);
  }

  

}
